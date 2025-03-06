import { Injectable } from '@nestjs/common';
import {
  getPaginationData,
  PaginatedData,
  PaginationQuery,
  PrismaService,
  User,
} from '@optimatech88/titomeet-shared-lib';
import { Notification } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: PaginationQuery,
    user: User,
  ): Promise<PaginatedData<Notification>> {
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
  }
}
