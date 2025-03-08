import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class NotificationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  notifiedToId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  userId: string;

  @ApiProperty()
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  read: boolean;

  @ApiProperty()
  @IsObject()
  @IsNotEmpty()
  data: object;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  createdAt: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  updatedAt: string;
}
