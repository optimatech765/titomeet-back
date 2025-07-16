import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EVENT_EVENTS } from 'src/utils/events';
import {
  NotificationType,
  PrismaService,
} from '@optimatech88/titomeet-shared-lib';
import { EventValidation } from 'src/events/events';
import { NotificationsService } from '../notifications.service';

@Injectable()
export class NotificationListener {
  private logger = new Logger('NotificationListener');
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @OnEvent(EVENT_EVENTS.EVENT_VALIDATED)
  async sendEventValidatedNotification(confirmationEvent: EventValidation) {
    try {
      this.logger.log('Received event validated event');
      const { eventId, validated } = confirmationEvent;

      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
        include: {
          providers: true,
        },
      });

      if (!event) {
        this.logger.error('Event not found');
        return;
      }

      //notify event owner
      await this.notificationsService.sendNotification({
        notificationPayload: {
          notifiedToId: event.postedById,
          type: validated
            ? NotificationType.EVENT_VALIDATION
            : NotificationType.EVENT_REJECTION,
          data: {
            eventId,
          },
        },
        sendByMail: true,
      });

      if (validated) {
        //notify providers
        event.providers.forEach(async (provider) => {
          //send email to provider
          this.logger.log(`Sending email to provider ${provider.name}`);
          await this.notificationsService.sendNotification({
            notificationPayload: {
              notifiedToId: provider.id,
              type: NotificationType.EVENT_ASSIGNMENT,
              data: {
                eventId,
              },
            },
            sendByMail: true,
          });
        });
      }
    } catch (error) {
      this.logger.error('Error sending event validated event', error);
    }
  }
}
