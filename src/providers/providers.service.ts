import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

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
import { Prisma, ProviderStatus, User, UserRole } from '@prisma/client';
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
        docs,
      } = payload;

      const docsArray = docs.map((doc) => ({
        type: doc.type,
        url: doc.url,
        name: doc.name,
      }));

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
          docs: docsArray,
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

  async getProviders(query: GetProvidersQueryDto, user?: User) {
    try {
      const { search, status } = query;

      const { skip, limit, page } = getPaginationData(query);

      const filter: Prisma.ProviderWhereInput = {};

      if (search) {
        filter.name = {
          contains: search,
          mode: 'insensitive',
        };
      }

      if (user) {
        if (user.role === UserRole.ADMIN) {
          if (status) {
            filter.status = status;
          }
        } else {
          filter['OR'] = [
            { status: ProviderStatus.APPROVED },
            { userId: user.id },
          ];
        }
      }

      const providers = await this.prisma.provider.findMany({
        where: filter,
        include: {
          category: true,
          address: true,
        },
        skip,
        take: limit,
      });

      return {
        items: providers,
        total: providers.length,
        totalPages: Math.ceil(providers.length / limit),
        page,
        limit,
      };
    } catch (error) {
      throwServerError(error);
    }
  }

  async getProviderById(id: string) {
    try {
      const provider = await this.prisma.provider.findUnique({
        where: { id },
        include: {
          category: true,
          address: true,
        },
      });

      if (!provider) {
        throw new NotFoundException('Provider not found');
      }

      return provider;
    } catch (error) {
      throwServerError(error);
    }
  }
}
