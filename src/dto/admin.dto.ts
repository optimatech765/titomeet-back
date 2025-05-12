import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto } from './users.dto';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus, UserRole } from '@optimatech88/titomeet-shared-lib';
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
