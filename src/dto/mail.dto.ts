//create mail dto
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Attachment } from 'nodemailer/lib/mailer';
import { PaginationQueryDto } from './users.dto';

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

export enum NewsLetterActionDto {
  Subscribe = 'SUBSCRIBE',
  Unsubscribe = 'UNSUBSCRIBE',
}

export class NewsLetterDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ enum: NewsLetterActionDto, description: "SUBSCRIBE or UNSUBSCRIBE" })
  @IsEnum(NewsLetterActionDto)
  @IsNotEmpty()
  action: NewsLetterActionDto;
}

export class GetNewsletterSubscriptions extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search term for users' })
  @IsString()
  @IsOptional()
  search?: string;
}
