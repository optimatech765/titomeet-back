import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  Address,
  PaginationQuery,
  PrismaService,
} from '@optimatech88/titomeet-shared-lib';
import { PaginatedData } from '@optimatech88/titomeet-shared-lib';
import { getPaginationData } from '@optimatech88/titomeet-shared-lib';

import axios from 'axios';
import appConfig from 'src/config';
import { SearchAddressDto } from 'src/dto/address.dto';
import { FeatureCollection, PlaceSuggestion } from 'src/types/geocode';

@Injectable()
export class AddressesService {
  private logger = new Logger('AddressService');
  private apiKeyIndex = 0;
  constructor(private readonly prisma: PrismaService) {}

  private getApikey(): string {
    const geocodeApiKey = appConfig().geocodeApiKey ?? '';
    const apiKeys = geocodeApiKey.split(',').map((key) => key.trim());
    const key = apiKeys[this.apiKeyIndex];
    this.apiKeyIndex = (this.apiKeyIndex + 1) % apiKeys.length; // Rotate to the next key
    return key;
  }

  //Fetch addresses from geoapify utils
  async getGeoapifyAddresses(query: string): Promise<Address[]> {
    try {
      const apiKey = this.getApikey();
      this.logger.log(`Using geoapify api key ${apiKey}`);
      const { data } = await axios(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&apiKey=${apiKey}&filter=countrycode:bj&lang=fr`,
      );
      const json = data as FeatureCollection;
      const results = json.features.map((f) => ({
        city: f.properties.city,
        country: f.properties.country,
        line1: f.properties.address_line1,
        line2: f.properties.address_line2,
        state: f.properties.state,
        postalCode: f.properties.postcode || '',
        countryCode: f.properties.country_code,
        latitude: f.properties.lat,
        longitude: f.properties.lon,
        resultType: f.properties.result_type,
      }));
      //check address not already in db
      const addressLines = results.map((r) => r.line1);

      const existingAddresses = await this.prisma.address.findMany({
        where: {
          name: { in: addressLines },
        },
      });

      const existingAddressLines = existingAddresses.map((a) => a.name);

      const resultsToSave = results
        .filter((r) => !existingAddressLines.includes(r.line1))
        .map((r) => ({
          name: r.line1,
          line2: r.line2,
          city: r.city,
          country: r.country,
          state: r.state,
          postalCode: r.postalCode,
          countryCode: r.countryCode,
          latitude: r.latitude,
          longitude: r.longitude,
          type: r.resultType,
        }));

      this.logger.log(`Saving ${resultsToSave.length} addresses`);

      await this.prisma.address.createMany({
        data: resultsToSave,
      });

      const savedAddresses = await this.prisma.address.findMany({
        where: {
          name: { in: resultsToSave.map((r) => r.name) },
        },
      });

      return savedAddresses;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }

  /**
   * Fetch addresses from Google Places API and store in DB if not existing
   */
  async getGoogleAddresses(query: string): Promise<Address[]> {
    try {
      const apiKey = appConfig().googleMapsApiKey;
      this.logger.log(`Using Google Maps API key ${apiKey}`);

      // 1️⃣ Fetch predictions from Google Places Autocomplete
      const { data: predictionsData } = await axios.get(
        'https://maps.googleapis.com/maps/api/place/autocomplete/json',
        {
          params: {
            input: query,
            key: apiKey,
            language: 'fr',
            components: 'country:BJ', // filter to Benin
          },
        },
      );

      if (predictionsData.status !== 'OK') {
        this.logger.warn(
          `Google Places API returned status ${predictionsData.status}`,
        );
        return [];
      }

      const predictions = predictionsData.predictions;

      // 2️⃣ Get detailed information for each place
      const detailedAddresses = await Promise.all(
        predictions.map(async (prediction: any) => {
          const placeId = prediction.place_id;
          const { data: detailsData } = await axios.get(
            'https://maps.googleapis.com/maps/api/place/details/json',
            {
              params: {
                place_id: placeId,
                key: apiKey,
                language: 'fr',
              },
            },
          );

          const result = detailsData.result;
          if (!result) return null;

          const components = this.extractAddressComponents(
            result.address_components,
          );
          return {
            name: result.formatted_address,
            line2: result.name,
            city: components.city,
            country: components.country,
            state: components.state,
            postalCode: components.postalCode,
            countryCode: components.countryCode,
            latitude: result.geometry?.location?.lat ?? null,
            longitude: result.geometry?.location?.lng ?? null,
            type: result.types?.[0] ?? 'unknown',
          };
        }),
      );

      const results = detailedAddresses.filter(Boolean);

      // 3️⃣ Save new addresses to DB
      const addressNames = results.map((r) => r.name);
      const existingAddresses = await this.prisma.address.findMany({
        where: { name: { in: addressNames } },
      });

      const existingNames = existingAddresses.map((a) => a.name);

      const resultsToSave = results.filter(
        (r) => !existingNames.includes(r.name),
      );

      this.logger.log(`Saving ${resultsToSave.length} new addresses...`);

      if (resultsToSave.length > 0) {
        await this.prisma.address.createMany({ data: resultsToSave });
      }

      const savedAddresses = await this.prisma.address.findMany({
        where: { name: { in: resultsToSave.map((r) => r.name) } },
      });

      return savedAddresses;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Failed to fetch Google addresses',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Helper to extract structured fields from Google’s address_components array
   */
  private extractAddressComponents(components: any[]) {
    const get = (type: string) =>
      components.find((c) => c.types.includes(type))?.long_name ?? '';

    return {
      city: get('locality') || get('administrative_area_level_2'),
      state: get('administrative_area_level_1'),
      country: get('country'),
      countryCode:
        components.find((c) => c.types.includes('country'))?.short_name ?? '',
      postalCode: get('postal_code'),
    };
  }

  //get address list
  async find(query: any): Promise<PaginatedData<Address>> {
    try {
      const { page, skip, limit } = getPaginationData(query as PaginationQuery);
      const searchQuery = query as SearchAddressDto;

      const { query: search } = searchQuery;

      const params = {
        ...(search && {
          OR: [
            {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              line2: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        }),
      } as any;

      if (search) {
      }

      const total = await this.prisma.address.count({
        where: {
          ...params,
        },
      });

      const totalPages = Math.ceil(total / limit);

      const addresses =
        page === 1 && total < 2 && search
          ? await this.getGoogleAddresses(search)
          : await this.prisma.address.findMany({
              where: {
                ...params,
              },
              skip,
              take: limit,
            });

      /*const cityLevelAddresses = []   await this.prisma.address.findMany({
        where: {
          ...params,
          type: 'city',
        },
        take: 2,
      }); */

      const items = [...addresses];

      const result = {
        items,
        total,
        page,
        limit,
        totalPages,
      };

      return result;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //Geocode utils
  async getGeocode(query: string): Promise<PlaceSuggestion[]> {
    try {
      const apiKey = appConfig().geocodeApiKey;
      const { data } = await axios(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&apiKey=${apiKey}&filter=countrycode:bj`,
      );
      const json = data as FeatureCollection;
      const results = json.features.map((f) => ({
        city: f.properties.city,
        country: f.properties.country,
        line1: f.properties.formatted,
        line2: f.properties.address_line2,
        state: f.properties.state,
        postalCode: f.properties.postcode || '',
        countryCode: f.properties.country_code,
        lon: f.properties.lon,
        lat: f.properties.lat,
        resultType: f.properties.result_type,
      }));
      //check address not already in db
      const addressLines = results.map((r) => r.line1);

      const existingAddresses = await this.prisma.address.findMany({
        where: {
          name: { in: addressLines },
        },
      });

      const existingAddressLines = existingAddresses.map((a) => a.name);

      const resultsToSave = results
        .filter((r) => !existingAddressLines.includes(r.line1))
        .map((r) => ({
          name: r.line1,
          line2: r.line2,
          city: r.city,
          country: r.country,
          state: r.state,
          postalCode: r.postalCode,
        }));

      this.logger.log(`Saving ${resultsToSave.length} addresses...`);

      await this.prisma.address.createMany({
        data: resultsToSave,
      });

      this.logger.log(results);

      return results;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
