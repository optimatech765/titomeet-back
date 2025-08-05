import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { getPaginationData, PrismaService, User } from '@optimatech88/titomeet-shared-lib';
import {
  UpdateUserDto,
  UpdateUserStatusDto,
  UserInterestDtoPayload,
} from '../dto/users.dto';
import { throwServerError } from 'src/utils';
import { GetPricingsQueryDto } from 'src/dto/admin.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(private prisma: PrismaService) { }

  async getUserData(user: User) {
    try {
      const userData = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: {
          accounts: true,
        },
      });
      return userData;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUser(user: User, payload: UpdateUserDto) {
    try {
      if (payload.username !== user.username) {
        const existingUser = await this.prisma.user.findUnique({
          where: { username: payload.username },
        });
        if (existingUser) {
          throw new HttpException(
            'Username already exists',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          ...payload,
          email: user.email,
          password: user.password,
        },
        include: {
          accounts: true,
        },
      });
      return updatedUser;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUserStatus(user: User, payload: UpdateUserStatusDto) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: { status: payload.status },
      });
      return updatedUser;
    } catch (error) {
      return throwServerError(error);
    }
  }

  async getOrCreateUserInterests(user: User) {
    try {
      let userInterests = await this.prisma.userInterests.findUnique({
        where: {
          userId: user.id,
        },
        include: {
          interests: true,
        },
      });

      if (!userInterests) {
        userInterests = await this.prisma.userInterests.create({
          data: {
            id: user.id,
            userId: user.id,
            interests: {
              connect: [],
            },
          },
          include: {
            interests: true,
          },
        });
      }
      return userInterests;
    } catch (error) {
      return throwServerError(error);
    }
  }

  async saveInterests(user: User, payload: UserInterestDtoPayload) {
    try {
      const userInterests = await this.getOrCreateUserInterests(user);

      const updatedUser = await this.prisma.userInterests.update({
        where: { id: userInterests.id },
        data: {
          interests: {
            connect: payload.interests.map((interest) => ({ id: interest })),
          },
        },
        include: {
          interests: true,
        },
      });
      return updatedUser;
    } catch (error) {
      return throwServerError(error);
    }
  }

  async getInterests(user: User) {
    try {
      const userInterests = await this.getOrCreateUserInterests(user);
      return userInterests;
    } catch (error) {
      return throwServerError(error);
    }
  }

  async getPricings(query: GetPricingsQueryDto) {
    try {
      const { skip, page, limit } = getPaginationData(query);
      const where = {} as any;

      if (query.search) {
        where.OR = [
          { title: { contains: query.search, mode: 'insensitive' } },
        ];
      }

      if (query.type) {
        where.type = query.type;
      }

      const pricings = await this.prisma.pricing.findMany({
        where,
        skip,
        take: limit,
      });

      const total = await this.prisma.pricing.count({
        where,
      });

      return {
        items: pricings,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      return throwServerError(error);
    }
  }
}
