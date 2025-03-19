import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SearchAddressDto {
  @ApiPropertyOptional({ description: 'Search term for address' })
  @IsOptional()
  @IsString({ each: true })
  query?: string;
}

export class AddressDto {
  @ApiProperty({ description: 'Address ID' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Address name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Address line 2' })
  @IsString()
  @IsOptional()
  line2?: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'State' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'Country' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ description: 'Postal code' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;
}

export class GetAddressesResponseDto {
  @ApiProperty({ type: [AddressDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  items: AddressDto[];

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
