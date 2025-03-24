import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PaginationQueryDto } from './users.dto';
import { Type } from 'class-transformer';

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
