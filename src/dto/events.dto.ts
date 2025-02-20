import { EventAccess, EventVisibility } from '@optimatech88/titomeet-shared-lib';
import { IsEnum, IsNumber, IsOptional, MaxLength, MinLength } from 'class-validator';

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

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(250)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(1000)
  description: string;

  @IsString()
  @IsNotEmpty()
  badge: string;

  @IsString()
  @IsNotEmpty()
  coverPicture: string;

  @IsString()
  @IsNotEmpty()
  addressId: string;

  @IsNumber()
  @IsNotEmpty()
  capacity: number;

  @IsString()
  @IsNotEmpty()
  tags: string[];

  @IsEnum(EventAccess)
  @IsNotEmpty()
  accessType: EventAccess;

  @IsEnum(EventVisibility)
  @IsNotEmpty()
  visibility: EventVisibility;

  @IsString()
  @IsNotEmpty()
  prices: EventPriceDto[];

  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  endDate: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;
}


export class UpdateEventDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  badge: string;        

  @IsString()
  @IsNotEmpty()
  coverPicture: string;

  @IsString()
  @IsNotEmpty()
  addressId: string;

  @IsNumber()
  @IsNotEmpty()
  capacity: number;

  @IsString()
  @IsNotEmpty()
  tags: string[];

  @IsEnum(EventAccess)
  @IsNotEmpty()
  accessType: EventAccess;

  @IsEnum(EventVisibility)
  @IsNotEmpty()
  visibility: EventVisibility;

  @IsString()
  @IsNotEmpty()
  prices: EventPriceDto[];

  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  endDate: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;  
}   

