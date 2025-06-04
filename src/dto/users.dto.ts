import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@optimatech88/titomeet-shared-lib';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Page number' })
  @IsString()
  @IsOptional()
  page?: string;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsString()
  @IsOptional()
  limit?: string;
}

export class TimeStampDto {
  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;
}

export class ModelBaseDto extends TimeStampDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class AccountDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  expiresAt: Date;
}

export class UserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({ type: [AccountDto] })
  @IsOptional()
  accounts?: AccountDto[] | null;

  @ApiProperty()
  @IsString()
  @IsOptional()
  profilePicture?: string | null;

  @ApiProperty({ enum: UserStatus })
  @IsEnum(UserStatus)
  @IsNotEmpty()
  status: UserStatus;
}

export class UpdateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  profilePicture?: string;
}

export class UpdateUserStatusDto {
  @ApiProperty({ enum: UserStatus })
  @IsEnum(UserStatus)
  @IsNotEmpty()
  status: UserStatus;
}


export class UserInterestDtoPayload {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsNotEmpty()
  interests: string[];
}

export class UserInterestDto extends UserInterestDtoPayload {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;
}
