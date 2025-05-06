import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService, User } from '@optimatech88/titomeet-shared-lib';
import { throwServerError } from 'src/utils';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrderByReference(reference: string /* , user?: User */) {
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
}
