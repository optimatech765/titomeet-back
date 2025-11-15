import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EVENT_EVENTS } from 'src/utils/events';
import { PrismaService } from '@optimatech88/titomeet-shared-lib';
import { EventValidation } from '../events';

@Injectable()
export class EventListener {
  private logger = new Logger('EventListener');
  constructor(private readonly prisma: PrismaService) {}

  @OnEvent(EVENT_EVENTS.EVENT_VALIDATED)
  async sendOrderConfirmationMail(confirmationEvent: EventValidation) {
    try {
      this.logger.log(
        'Received event validated event',
        confirmationEvent.eventId,
      );
    } catch (error) {
      this.logger.error('Error sending event validated event', error);
    }
  }
}
