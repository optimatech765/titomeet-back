import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  getPaginationData,
  PaginatedData,
  PrismaService,
  User,
} from '@optimatech88/titomeet-shared-lib';
import { Notification } from '@prisma/client';
import { PaginationQueryDto } from 'src/dto/users.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: PaginationQueryDto,
    user: User,
  ): Promise<PaginatedData<Notification>> {
    try {
      const { page, limit, skip } = getPaginationData(query);

      const filter = {
        notifiedToId: user.id,
      };

      const notifications = await this.prisma.notification.findMany({
        where: filter,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      const total = await this.prisma.notification.count({
        where: filter,
      });

      return {
        items: notifications,
        total,
        totalPages: Math.ceil(total / limit),
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
