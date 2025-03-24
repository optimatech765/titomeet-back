import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '@optimatech88/titomeet-shared-lib';
import { CreateProviderDto, GetProvidersQueryDto } from 'src/dto/providers.dto';
import { User } from '@prisma/client';
import { throwServerError } from 'src/utils';
import { getPaginationData } from 'src/utils/pagination';

@Injectable()
export class ProvidersService {
  private readonly logger = new Logger(ProvidersService.name);
  constructor(private readonly prisma: PrismaService) {}

  async createProvider(payload: CreateProviderDto, user: User) {
    try {
      const { name, description, image } = payload;

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
          user: {
            connect: {
              id: user.id,
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
      const { search, page, limit } = query;

      const { skip, take } = getPaginationData(query);

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
        take,
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
