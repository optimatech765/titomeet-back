import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  EventAccess,
  EventStatus,
  EventVisibility,
} from '@optimatech88/titomeet-shared-lib';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  ValidateNested,
  IsString,
} from 'class-validator';

import { IsNotEmpty } from 'class-validator';
import { UserDto } from './users.dto';
import { PaginationQueryDto } from './users.dto';
import { ProviderDto } from './providers.dto';
import { AddressDto } from './address.dto';
export class EventCategoryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search term for event categories' })
  @IsString()
  @IsOptional()
  search?: string;
}

export class EventCategoryDto {
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
  @IsOptional()
  description: string;
}

export class EventPriceDtoPayload {
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
}

export class EventPriceUpdateDtoPayload extends EventPriceDtoPayload {
  @ApiProperty()
  @IsString()
  @IsOptional()
  id?: string;
}

export class EventPriceDto extends EventPriceDtoPayload {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  eventId: string;
}

export class EventBaseDto {
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
  @IsArray()
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

export class EventDto extends EventBaseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ type: [EventPriceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventPriceDto)
  @IsOptional()
  prices: EventPriceDto[];

  @ApiProperty({ type: [EventCategoryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventCategoryDto)
  @IsOptional()
  categories: EventCategoryDto[];

  @ApiProperty({ enum: EventStatus })
  @IsEnum(EventStatus)
  @IsNotEmpty()
  status: EventStatus;

  @ApiProperty({ type: [ProviderDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProviderDto)
  @IsOptional()
  providers: ProviderDto[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  createdById: string;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  createdBy: UserDto;

  @ApiProperty({ type: AddressDto })
  @IsObject()
  address: AddressDto;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  ticketsSold?: number;
}

export class CreateEventDto extends EventBaseDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  categories: string[];

  @ApiProperty({ type: [EventPriceDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EventPriceDtoPayload)
  prices?: EventPriceDtoPayload[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsOptional()
  providers: string[];

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;
}

export class UpdateEventDto extends EventBaseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ type: [EventPriceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventPriceUpdateDtoPayload)
  @IsOptional()
  prices: EventPriceUpdateDtoPayload[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsOptional()
  categories: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsOptional()
  providers: string[];
}

export enum EventQueryStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
  FINISHED = 'FINISHED',
  FAVORITE = 'FAVORITE',
}

export class GetEventsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search term for events' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'List of tags to filter events',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Type(() => String)
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Start date for filtering events (YYYY-MM-DD)',
  })
  @IsString()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'End date for filtering events (YYYY-MM-DD)',
  })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'User ID of the event creator' })
  @IsString()
  @IsOptional()
  createdById?: string;

  @ApiPropertyOptional({ description: 'Status of the event' })
  @IsEnum(EventQueryStatus)
  @IsOptional()
  status?: EventQueryStatus;
}

export class PopulatedEventDto extends EventDto {
  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @IsOptional()
  isAttending?: boolean;
}

export class GetEventsResponseDto {
  @ApiProperty({ type: [PopulatedEventDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PopulatedEventDto)
  items: PopulatedEventDto[];

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

export class UpdateEventCategoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class GetEventOrdersQueryDto extends PaginationQueryDto {}
