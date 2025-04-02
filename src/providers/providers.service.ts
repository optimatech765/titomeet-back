import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import {
  getPaginationData,
  PaginatedData,
  PrismaService,
  ProviderCategory,
} from '@optimatech88/titomeet-shared-lib';
import {
  CreateProviderDto,
  GetProvidersQueryDto,
  ProviderCategoryQueryDto,
} from 'src/dto/providers.dto';
import { User } from '@prisma/client';
import { throwServerError } from 'src/utils';

@Injectable()
export class ProvidersService {
  private readonly logger = new Logger(ProvidersService.name);
  constructor(private readonly prisma: PrismaService) {}

  async getProviderCategories(
    query: ProviderCategoryQueryDto,
  ): Promise<PaginatedData<ProviderCategory>> {
    try {
      const { page, limit, skip } = getPaginationData(query);

      const filter: any = {};

      if (query.search) {
        filter.name = {
          contains: query.search,
        };
      }

      const categories = await this.prisma.providerCategory.findMany({
        where: filter,
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      });

      const total = await this.prisma.providerCategory.count({
        where: filter,
      });

      return {
        items: categories,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(error);
      return throwServerError(error);
    }
  }

  async createProvider(payload: CreateProviderDto, user: User) {
    try {
      const {
        name,
        description,
        image,
        categoryId,
        addressId,
        email,
        phoneNumber,
        website,
        pricingDetails,
      } = payload;

      //? Check if provider already exists
      const provider = await this.prisma.provider.findFirst({
        where: { name },
      });

      if (provider) {
        throw new BadRequestException('Provider already exists');
      }

      //? Create provider
      const newProvider = await this.prisma.provider.create({
        data: {
          name,
          description,
          image,
          email,
          phoneNumber,
          website,
          pricingDetails,
          user: {
            connect: {
              id: user.id,
            },
          },
          category: {
            connect: {
              id: categoryId,
            },
          },
          address: {
            connect: {
              id: addressId,
            },
          },
        },
      });

      return newProvider;
    } catch (error) {
      throwServerError(error);
    }
  }

  async getProviders(query: GetProvidersQueryDto) {
    try {
      const { search } = query;

      const { skip, limit, page } = getPaginationData(query);

      const filter: any = {};

      if (search) {
        filter.name = {
          contains: search,
          mode: 'insensitive',
        };
      }

      const providers = await this.prisma.provider.findMany({
        where: filter,
        skip,
        take: limit,
      });

      return {
        items: providers,
        total: providers.length,
        page,
        limit,
      };
    } catch (error) {
      throwServerError(error);
    }
  }
}
