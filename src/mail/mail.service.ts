import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { createTransport } from 'nodemailer';
import mailConfig from '../config/mail';
import {
  SendMailDto,
  NewsLetterDto,
  NewsLetterActionDto,
} from 'src/dto/mail.dto';
import { PrismaService } from '@optimatech88/titomeet-shared-lib';
import { SendNewsletterEvent } from './events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MAIL_EVENTS } from 'src/utils/events';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  //init nodemailer transporter
  private readonly transporter = createTransport({
    host: mailConfig().smtpHost,
    name: 'Titomeet',
    port: Number(mailConfig().smtpPort),
    secure: true,
    auth: {
      user: mailConfig().smtpUser,
      pass: mailConfig().smtpPassword,
    },
    tls: {
      rejectUnauthorized: false, // Set to true for production, false for development/testing with self-signed certs
    }
  });

  async sendMail(payload: SendMailDto) {
    try {
      const isConnected = await this.transporter.verify();
      if (!isConnected) {
        throw new Error('Failed to connect to SMTP server');
      }
      await this.transporter.sendMail({
        from: `"Titomeet" <${mailConfig().smtpUser}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        attachments: payload.attachments,
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  async subscribeToNewsletter(newsletterDto: NewsLetterDto) {
    try {
      // Check if email already exists in newsletter subscriptions
      const existingSubscription =
        await this.prismaService.newsletter.findUnique({
          where: {
            email: newsletterDto.email,
          },
        });

      if (newsletterDto.action === NewsLetterActionDto.Subscribe) {
        if (!existingSubscription) {
          await this.prismaService.newsletter.create({
            data: {
              email: newsletterDto.email,
            },
          });
          //send welcome message
          const sendNewsletterEvent = new SendNewsletterEvent();
          sendNewsletterEvent.email = newsletterDto.email;
          this.eventEmitter.emit(
            MAIL_EVENTS.SEND_NEWSLETTER,
            sendNewsletterEvent,
          );
        } else {
          if (existingSubscription.unsubscribedAt) {
            await this.prismaService.newsletter.update({
              where: {
                id: existingSubscription.id,
              },
              data: {
                unsubscribedAt: null,
              },
            });
          }
        }
      } else {
        if (existingSubscription) {
          if (existingSubscription.unsubscribedAt) {
            throw new ConflictException(
              'Email already unsubscribed from newsletter',
            );
          }
          await this.prismaService.newsletter.update({
            where: {
              id: existingSubscription.id,
            },
            data: {
              unsubscribedAt: new Date(),
            },
          });
        } else {
          throw new NotFoundException(
            'Email not found in newsletter subscriptions',
          );
        }
      }

      return { message: 'Newsletter subscription updated successfully' };
    } catch (error) {
      this.logger.error(
        `Newsletter subscription failed for ${newsletterDto.email}:`,
        error,
      );
      throw new ConflictException('Failed to subscribe to newsletter');
    }
  }
}
