import { ApiProperty } from '@nestjs/swagger';
import {
  EventAccess,
  EventVisibility,
} from '@optimatech88/titomeet-shared-lib';
import {
    IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

import { IsString } from 'class-validator';

import { IsNotEmpty } from 'class-validator';

export class EventPriceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  description: string;

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

  @ApiProperty()
  @IsEnum(EventAccess)
  @IsNotEmpty()
  accessType: EventAccess;

  @ApiProperty()
  @IsEnum(EventVisibility)
  @IsNotEmpty()
  visibility: EventVisibility;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
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

  @ApiProperty()
  @IsEnum(EventAccess)
  @IsNotEmpty()
  accessType: EventAccess;

  @IsEnum(EventVisibility)
  @IsNotEmpty()
  visibility: EventVisibility;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
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

  @ApiProperty()
  @IsEnum(EventAccess)
  @IsNotEmpty()
  accessType: EventAccess;

  @ApiProperty()
  @IsEnum(EventVisibility)
  @IsNotEmpty()
  visibility: EventVisibility;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
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
  @ApiProperty()
  @IsArray()
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
}

