import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto } from './users.dto';
import { Type } from 'class-transformer';
import { AddressDto } from './address.dto';

export class ProviderCategoryDto {
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

export class ProviderDto {
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
  image: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  addressId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ type: ProviderCategoryDto })
  @IsObject()
  category: ProviderCategoryDto;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: AddressDto;
}

export class CreateProviderDto {
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
  @IsOptional()
  image: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  addressId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  categoryId: string;
}

export class GetProvidersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search term for providers' })
  @IsString()
  @IsOptional()
  search?: string;
}

export class GetProvidersResponseDto {
  @ApiProperty({ type: [ProviderDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProviderDto)
  items: ProviderDto[];

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


export class UpdateProviderCategoryDto {
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

export class ProviderCategoryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search term for provider categories' })
  @IsString()
  @IsOptional()
  search?: string;
}


export class GetProviderCategoriesResponseDto {
  @ApiProperty({ type: [ProviderCategoryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProviderCategoryDto)
  items: ProviderCategoryDto[];

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
