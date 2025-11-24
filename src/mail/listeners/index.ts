import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ForgotPasswordEvent,
  SendNewsletterEvent,
  SendNotificationByMailEvent,
} from '../events';

import { MailService } from '../mail.service';
import { MAIL_EVENTS, ORDER_EVENTS } from 'src/utils/events';
import appConfig from 'src/config';
import { EventAccess, PrismaService } from '@optimatech88/titomeet-shared-lib';
import { generateTicketPDF, getEventUrl } from 'src/utils/orders';
import { Attachment } from 'nodemailer/lib/mailer';
import { OrderConfirmationEvent } from 'src/orders/events';
import { getMailDetails } from 'src/utils/notification';
import { SendMailDto } from 'src/dto/mail.dto';
import { AssetsService } from 'src/assets/assets.service';
import { randomUUID } from 'crypto';

@Injectable()
export class MailListener {
  private logger = new Logger('MailListener');
  constructor(
    private mailService: MailService,
    private readonly prisma: PrismaService,
    private readonly assetsService: AssetsService,
  ) { }

  @OnEvent(MAIL_EVENTS.FORGOT_PASSWORD)
  async sendForgotPasswordMail(event: ForgotPasswordEvent) {
    try {
      this.logger.log('Sending forgot password mail');
      const { email: userEmail, username, token } = event;
      const { frontendUrl } = appConfig();

      const link = `${frontendUrl}/auth/reset-password?token=${token}`;
      this.mailService.sendMail({
        to: userEmail,
        username,
        subject: 'Réinitialisation de mot de passe',
        html: `
        <p>Bonjour ${username},</p>
        <p>Vous avez oublié votre mot de passe ?</p>
        <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
        <a href="${link}">Réinitialiser mon mot de passe</a>
        `,
      });
      this.logger.log('Forgot password mail sent to ' + userEmail);
    } catch (error) {
      this.logger.error('Error sending forgot password mail', error);
    }
  }

  @OnEvent(ORDER_EVENTS.ORDER_CONFIRMED)
  async sendOrderConfirmationMail(confirmationEvent: OrderConfirmationEvent) {
    try {
      this.logger.log('Sending order confirmation mail');
      const { order } = confirmationEvent;
      if (!order) {
        this.logger.error('Order not found');
        throw new Error('Order not found');
      }
      const { event, user, items } = order;
      const attachments = [] as Attachment[];
      const tickets = [] as any;

      // Group tickets by order item
      items.forEach((item) => {
        const itemTickets = Array.from({ length: item.quantity }).map(
          (_, i) => ({
            orderItemId: item.id,
            quantity: 1,
            ticketCode: `${item.eventPrice.name}-${i + 1}`,
            eventPrice: item.eventPrice,
          }),
        );
        tickets.push(...itemTickets);
      });

      // Generate PDFs and upload to AWS
      const ticketsBufferPromises = tickets.map(
        async (ticket: {
          orderItemId: string;
          eventPrice: { name: any };
          ticketCode: string;
        }) => {
          const pdfBytes = await generateTicketPDF({
            eventName: event.name,
            location: event.address?.name || event.location || 'Location TBD',
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
            startTime: event.startTime,
            endTime: event.endTime,
            ticketCode: ticket.ticketCode,
            ticketType: ticket.eventPrice.name,
            userEmail: user.email,
            url: getEventUrl(event.id),
            isFree: event.accessType === EventAccess.FREE,
            orderId: order.id,
          });

          // Upload to AWS
          const fileName = `tickets/${order.id}/${randomUUID()}-${ticket.ticketCode}.pdf`;
          const uploadResult = await this.assetsService.uploadFile(
            Buffer.from(pdfBytes),
            fileName,
          );

          return {
            orderItemId: ticket.orderItemId,
            filename: `Ticket-${ticket.ticketCode}.pdf`,
            content: pdfBytes,
            ticketUrl: uploadResult.downloadUrl,
          };
        },
      );

      const ticketsBuffers = await Promise.all(ticketsBufferPromises);
      attachments.push(...ticketsBuffers);

      // Group ticket URLs by order item and update database
      const ticketUrlsByItem = new Map<string, string[]>();
      ticketsBuffers.forEach((ticket) => {
        if (!ticketUrlsByItem.has(ticket.orderItemId)) {
          ticketUrlsByItem.set(ticket.orderItemId, []);
        }
        ticketUrlsByItem.get(ticket.orderItemId)?.push(ticket.ticketUrl);
      });

      // Update each order item with ticket URLs
      const updatePromises = Array.from(ticketUrlsByItem.entries()).map(
        async ([orderItemId, ticketUrls]) => {
          await this.prisma.orderItem.update({
            where: { id: orderItemId },
            data: {
              tickets: ticketUrls,
            },
          });
        },
      );

      await Promise.all(updatePromises);
      this.logger.log('Ticket URLs saved to database');

      const isMultiple = items.length > 1;

      this.mailService.sendMail({
        to: user.email,
        username: user.firstName,
        subject: 'Confirmation de réservation',
        html: ` 
        <p>Bonjour ${user.firstName},</p>
        <p>Votre réservation de tickets a été effectuée avec succès.</p>
        <p>Voici ${isMultiple ? 'vos' : 'votre'} billet${isMultiple ? 's' : ''} pour l'événement ${event.name} :</p>
        ${ticketsBuffers.map((ticket) => `<a href="${ticket.ticketUrl}">${ticket.filename}</a>`).join('\n')}
        `,
        attachments,
      });

      this.logger.log('Order confirmation mail sent to ' + user.email);
    } catch (error) {
      this.logger.error('Error sending order confirmation mail', error);
    }
  }

  @OnEvent(MAIL_EVENTS.SEND_NOTIFICATION_BY_MAIL)
  async sendNotificationByMail(event: SendNotificationByMailEvent) {
    try {
      this.logger.log('Sending forgot password mail');
      const { notification } = event;

      const user = await this.prisma.user.findUnique({
        where: {
          id: notification.notifiedToId,
        },
      });

      if (!user) {
        this.logger.error('User not found');
        throw new Error('User not found');
      }

      const { subject, html } = await getMailDetails({
        notification,
        username: user.firstName,
      });

      this.mailService.sendMail({
        to: user.email,
        username: user.firstName,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error('Error sending forgot password mail', error);
    }
  }

  @OnEvent(MAIL_EVENTS.SEND_NEWSLETTER)
  async sendNewsletter(event: SendNewsletterEvent) {
    try {
      this.logger.log('Sending newsletter');
      const { email } = event;
      // Send welcome email to the subscriber
      const welcomeEmail: SendMailDto = {
        subject: 'Bienvenue sur notre newsletter !',
        html: `
          <h1>Bienvenue sur notre newsletter !</h1>
          <p>Merci de vous être inscrit à notre newsletter avec l'email: ${email}</p>
          <p>Vous recevrez désormais les dernières actualités et offres de notre part.</p>
          <p>Cordialement,<br>L'équipe</p>
        `,
        to: email,
        username: 'Abonnement à la newsletter',
      };

      await this.mailService.sendMail(welcomeEmail);
    } catch (error) {
      this.logger.error('Error sending newsletter', error);
    }
  }
}
