import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ForgotPasswordEvent, OrderConfirmationEvent } from '../events';

import { MailService } from '../mail.service';
import { MAIL_EVENTS } from 'src/utils/events';
import appConfig from 'src/config';
import { PrismaService } from '@optimatech88/titomeet-shared-lib';
import { generateTicketPDF } from 'src/utils/orders';
import { Attachment } from 'nodemailer/lib/mailer';

@Injectable()
export class MailListener {
  private logger = new Logger('MailListener');
  constructor(
    private mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

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
    } catch (error) {
      this.logger.error('Error sending forgot password mail', error);
    }
  }

  @OnEvent(MAIL_EVENTS.ORDER_CONFIRMATION)
  async sendOrderConfirmationMail(confirmationEvent: OrderConfirmationEvent) {
    try {
      this.logger.log('Sending order confirmation mail');
      const { orderId } = confirmationEvent;
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          event: {
            include: {
              address: true,
            },
          },
          user: true,
          items: {
            include: {
              eventPrice: true,
            },
          },
        },
      });
      if (!order) {
        this.logger.error('Order not found');
        throw new Error('Order not found');
      }
      const { event, user, items } = order;
      const attachments = [] as Attachment[];
      const ticketsBufferPromises = items.map(async (item) => {
        const pdfBytes = await generateTicketPDF({
          eventName: event.name,
          location: event.address.name,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          ticketCode: item.id,
          ticketType: item.eventPrice.name,
          userEmail: user.email,
        });
        return { filename: `Ticket-${item.id}.pdf`, content: pdfBytes };
      });
      const ticketsBuffers = await Promise.all(ticketsBufferPromises);
      attachments.push(...ticketsBuffers);

      const isMultiple = items.length > 1;

      this.mailService.sendMail({
        to: user.email,
        username: user.firstName,
        subject: 'Confirmation de commande',
        html: ` 
        <p>Bonjour ${user.firstName},</p>
        <p>Votre commande a été confirmée avec succès.</p>
        <p>Voici ${isMultiple ? 'vos' : 'votre'} billet${isMultiple ? 's' : ''} :</p>
        ${ticketsBuffers.map((ticket) => `<a href="${ticket.filename}">${ticket.filename}</a>`).join('\n')}
        `,
        attachments,
      });
    } catch (error) {
      this.logger.error('Error sending order confirmation mail', error);
    }
  }
}
