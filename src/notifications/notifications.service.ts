import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  getPaginationData,
  PaginatedData,
  PrismaService,
  User,
} from '@optimatech88/titomeet-shared-lib';
import { Notification } from '@prisma/client';
import {
  NotificationDto,
  SendNotificationDto,
} from 'src/dto/notifications.dto';
import { PaginationQueryDto } from 'src/dto/users.dto';
import { SendNotificationByMailEvent } from 'src/mail/events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MAIL_EVENTS } from 'src/utils/events';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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

  async sendNotification(payload: SendNotificationDto) {
    try {
      const { notificationPayload, sendByMail } = payload;
      const notificationData = notificationPayload.data as any;
      const newNotification = await this.prisma.notification.create({
        data: {
          notifiedToId: notificationPayload.notifiedToId,
          type: notificationPayload.type,
          data: notificationData || null,
          userId: notificationPayload.userId,
        },
      });

      if (sendByMail) {
        const sendNotificationByMailEvent = new SendNotificationByMailEvent();
        sendNotificationByMailEvent.notification = {
          ...newNotification,
          data: newNotification.data as object | null,
        };
        this.eventEmitter.emit(
          MAIL_EVENTS.SEND_NOTIFICATION_BY_MAIL,
          sendNotificationByMailEvent,
        );
      }

      return newNotification;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
