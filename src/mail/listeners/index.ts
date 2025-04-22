import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ForgotPasswordEvent } from '../events';

import { MailService } from '../mail.service';
import mailConfig from 'src/config/mail';
import { MAIL_EVENTS } from 'src/utils/events';
import appConfig from 'src/config';

@Injectable()
export class MailListener {
  private logger = new Logger('MailListener');
  constructor(private mailService: MailService) {}

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
}
