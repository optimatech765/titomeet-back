//create mail dto
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Attachment } from 'nodemailer/lib/mailer';

export class SendMailDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  html: string;

  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsOptional()
  attachments?: Attachment[];
}
