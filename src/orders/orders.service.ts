import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { getPaginationData, PrismaService, User } from '@optimatech88/titomeet-shared-lib';
import { GetEventOrdersQueryDto } from 'src/dto/events.dto';
import { throwServerError } from 'src/utils';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) { }

  async getOrderByReference(reference: string) {
    try {
      const order = await this.prisma.order.findFirst({
        where: {
          OR: [{ paymentIntentId: reference }, { id: reference }],
        },
        include: {
          items: {
            include: {
              eventPrice: true,
            },
          },
        },
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      /* if (order.userId !== user.id) {
        throw new ForbiddenException(
          'You are not allowed to access this order',
        );
      } */
      return order;
    } catch (error) {
      return throwServerError(error);
    }
  }

  async getOrdersByUser(query: GetEventOrdersQueryDto, user: User) {
    try {
      const { page, limit } = getPaginationData(query);
      const where = {
        userId: user.id,
      }
      const orders = await this.prisma.order.findMany({
        where,
        include: {
          items: {
            select: {
              eventPriceId: true,
              quantity: true,
              unitPrice: true,
            },
          },
          event: true
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      const total = await this.prisma.order.count({
        where,
      });

      return {
        items: orders,
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
