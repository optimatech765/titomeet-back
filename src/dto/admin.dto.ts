import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EventStatus } from '@optimatech88/titomeet-shared-lib';

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

  @ApiProperty({
    description: 'Event ID',
  })
  @IsNotEmpty()
  @IsString()
  eventId: string;
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
