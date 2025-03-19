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
        line1: f.properties.formatted,
        line2: f.properties.address_line2,
        state: f.properties.state,
        postalCode: f.properties.postcode || '',
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

  //get address list
  async find(query: any): Promise<PaginatedData<Address>> {
    try {
      const { page, skip, limit } = getPaginationData(query as PaginationQuery);
      const searchQuery = query as SearchAddressDto;

      const { query: search } = searchQuery;

      const params = {
        ...(search && {
          name: {
            contains: search,
            mode: 'insensitive',
          },
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
          ? await this.getGeoapifyAddresses(search)
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
