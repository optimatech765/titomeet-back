import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto } from './users.dto';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  EventStatus,
  PricingDuration,
  PricingType,
  UserRole,
} from '@optimatech88/titomeet-shared-lib';
import { UserDto } from './users.dto';
import { Type } from 'class-transformer';

export class CreateEventCategoryDto {
  @ApiProperty({
    description: 'Name of the event category',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the event category',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Parent ID of the event category',
  })
  @IsOptional()
  @IsString()
  parentId?: string;
}

export class UpdateEventStatusDto {
  @ApiProperty({
    enum: EventStatus,
    description: 'Status of the event',
  })
  @IsEnum(EventStatus)
  @IsNotEmpty()
  status: EventStatus;
}

export class CreateProviderCategoryDto {
  @ApiProperty({
    description: 'Name of the provider category',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the provider category',
  })
  @IsNotEmpty()
  @IsString()
  description: string;
}

export class AdminStatsDto {
  @ApiProperty({
    description: 'Total number of users',
  })
  @IsNotEmpty()
  @IsNumber()
  totalUsers: number;

  @ApiProperty({
    description: 'Total number of providers',
  })
  @IsNotEmpty()
  @IsNumber()
  totalProviders: number;

  @ApiProperty({
    description: 'Total number of events',
  })
  @IsNotEmpty()
  @IsNumber()
  totalEvents: number;

  @ApiProperty({
    description: 'Total number of bookings',
  })
  @IsNotEmpty()
  @IsNumber()
  totalBookings: number;
}

export class EventStatsDto {
  @ApiProperty({
    description: 'Total number of pending events',
  })
  @IsNotEmpty()
  @IsNumber()
  totalPendingEvents: number;

  @ApiProperty({
    description: 'Total number of published events',
  })
  @IsNotEmpty()
  @IsNumber()
  totalPublishedEvents: number;

  @ApiProperty({
    description: 'Total number of draft events',
  })
  @IsNotEmpty()
  @IsNumber()
  totalDraftEvents: number;

  @ApiProperty({
    description: 'Total number of rejected events',
  })
  @IsNotEmpty()
  @IsNumber()
  totalRejectedEvents: number;
}

export class GetUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search term for users' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Role of the user' })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

export class GetUsersResponseDto {
  @ApiProperty({ type: [UserDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserDto)
  items: UserDto[];

  @ApiProperty({
    description: 'Total number of users',
  })
  @IsNotEmpty()
  @IsNumber()
  total: number;

  @ApiProperty({
    description: 'Page number',
  })
  @IsNotEmpty()
  @IsNumber()
  page: number;

  @ApiProperty({
    description: 'Limit number',
  })
  @IsNotEmpty()
  @IsNumber()
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
  })
  @IsNotEmpty()
  @IsNumber()
  totalPages: number;
}


export class PricingBaseDto {
  @ApiProperty({
    description: 'Title of the pricing',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Subtitle of the pricing',
  })
  @IsNotEmpty()
  @IsString()
  subtitle: string;

  @ApiProperty({
    description: 'Price suffix of the pricing',
  })
  @IsOptional()
  @IsString()
  priceSuffix?: string;

  @ApiProperty({
    description: 'Features of the pricing',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiProperty({
    description: 'Type of the pricing',
  })
  @IsNotEmpty()
  @IsEnum(PricingType)
  type: PricingType;

  @ApiProperty({
    description: 'Duration of the pricing',
  })
  @IsNotEmpty()
  @IsEnum(PricingDuration)
  duration: PricingDuration;

  @ApiProperty({
    description: 'Amount of the pricing',
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Active status of the pricing',
  })
  @IsNotEmpty()
  @IsBoolean()
  active: boolean;
}

export class PricingDto extends PricingBaseDto {
  @ApiProperty({
    description: 'ID of the pricing',
  })
  @IsString()
  id: string;
}

export class GetPricingsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search term for pricings' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Type of the pricing' })
  @IsEnum(PricingType)
  @IsOptional()
  type?: PricingType;

  @ApiPropertyOptional({ description: 'Active status of the pricing' })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}


export class GetPricingsResponseDto {
  @ApiProperty({ type: [PricingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingDto)
  items: PricingDto[];

  @ApiProperty({
    description: 'Total number of pricings',
  })
  @IsNotEmpty()
  @IsNumber()
  total: number;

  @ApiProperty({
    description: 'Page number',
  })
  @IsNotEmpty()
  @IsNumber()
  page: number;

  @ApiProperty({
    description: 'Limit number',
  })
  @IsNotEmpty()
  @IsNumber()
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
  })
  @IsNotEmpty()
  @IsNumber()
  totalPages: number;
}