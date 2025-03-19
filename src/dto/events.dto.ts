import { ApiProperty } from '@nestjs/swagger';
import {
  EventAccess,
  EventVisibility,
} from '@optimatech88/titomeet-shared-lib';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { IsString } from 'class-validator';

import { IsNotEmpty } from 'class-validator';
import { UserDto } from './users.dto';

export class EventPriceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  eventId: string;
}

export class EventDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  badge: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  coverPicture: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  addressId: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  capacity: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tags: string[];

  @ApiProperty({ enum: EventAccess })
  @IsEnum(EventAccess)
  @IsNotEmpty()
  accessType: EventAccess;

  @ApiProperty({ enum: EventVisibility })
  @IsEnum(EventVisibility)
  @IsNotEmpty()
  visibility: EventVisibility;

  @ApiProperty({ type: [EventPriceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventPriceDto)
  @IsOptional()
  prices: EventPriceDto[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  createdById: string;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  createdBy: UserDto;
}

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(250)
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(1000)
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  badge: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  coverPicture: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  addressId: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  capacity: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tags: string[];

  @ApiProperty({ enum: EventAccess })
  @IsEnum(EventAccess)
  @IsNotEmpty()
  accessType: EventAccess;

  @ApiProperty({ enum: EventVisibility })
  @IsEnum(EventVisibility)
  @IsNotEmpty()
  visibility: EventVisibility;

  @ApiProperty({ type: [EventPriceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventPriceDto)
  prices: EventPriceDto[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  endTime: string;
}

export class UpdateEventDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  badge: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  coverPicture: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  addressId: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  capacity: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tags: string[];

  @ApiProperty({ enum: EventAccess })
  @IsEnum(EventAccess)
  @IsNotEmpty()
  accessType: EventAccess;

  @ApiProperty({ enum: EventVisibility })
  @IsEnum(EventVisibility)
  @IsNotEmpty()
  visibility: EventVisibility;

  @ApiProperty({ type: [EventPriceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventPriceDto)
  @IsOptional()
  prices: EventPriceDto[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  endTime: string;
}

export class GetEventsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  search: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  tags: string[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  endDate: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  createdById: string;
}

export class GetEventsResponseDto {
  @ApiProperty({ type: [EventDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventDto)
  items: EventDto[];

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  total: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  limit: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  totalPages: number;
}

