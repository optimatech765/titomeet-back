import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ORDER_EVENTS } from 'src/utils/events';
import { OrderStatus, PrismaService } from '@optimatech88/titomeet-shared-lib';
import { OrderConfirmationEvent } from 'src/orders/events';

@Injectable()
export class OrderListener {
  private logger = new Logger('OrderListener');
  constructor(private readonly prisma: PrismaService) {}

  @OnEvent(ORDER_EVENTS.ORDER_CONFIRMED)
  async sendOrderConfirmationMail(confirmationEvent: OrderConfirmationEvent) {
    try {
      this.logger.log('Received order confirmed event');
      const { order } = confirmationEvent;
      const { eventId, event, userId } = order;

      if (order.status !== OrderStatus.CONFIRMED) {
        this.logger.error('Order is not confirmed');
        throw new Error('Order is not confirmed');
      }
      //update remaining seats
      const totalSeatsBooked = order.items.reduce(
        (acc, item) => acc + item.quantity * item.eventPrice.totalSeats,
        0,
      );

      const remainingSeats = event.remainingSeats - totalSeatsBooked;

      await this.prisma.event.update({
        where: { id: eventId },
        data: { remainingSeats },
      });
      //make user join event chat
      const chat =
        (await this.prisma.chat.findUnique({
          where: { eventId },
        })) ||
        (await this.prisma.chat.create({
          data: {
            id: eventId,
            eventId,
            name: event.name,
          },
        }));

      const userChat = await this.prisma.chatUser.findFirst({
        where: {
          userId,
          chatId: chat.id,
        },
      });
      if (!userChat) {
        await this.prisma.chatUser.create({
          data: {
            chatId: chat.id,
            userId,
          },
        });
      }
    } catch (error) {
      this.logger.error('Error sending order confirmation mail', error);
    }
  }
}
