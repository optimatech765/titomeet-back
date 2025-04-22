import { Injectable, Logger } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import mailConfig from '../config/mail';
import { SendMailDto } from 'src/dto/mail.dto';
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  //init nodemailer transporter
  private readonly transporter = createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: mailConfig().senderEmail,
      pass: mailConfig().senderPassword,
    },
  });

  async sendMail(payload: SendMailDto) {
    try {
      await this.transporter.sendMail(payload);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
