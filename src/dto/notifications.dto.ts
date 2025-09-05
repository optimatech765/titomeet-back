import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsDate,
} from 'class-validator';
import { UserDto } from './users.dto';

export class NotificationPayloadDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  notifiedToId: string;

  @ApiProperty()
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @ApiProperty()
  @IsString()
  @IsOptional()
  userId?: string | null;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  read?: boolean;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  data?: object | null;
}

export class NotificationDto extends NotificationPayloadDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  user?: UserDto;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  read: boolean;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;
}

export class SendNotificationDto {
  notificationPayload: NotificationPayloadDto;
  sendByMail: boolean;
}