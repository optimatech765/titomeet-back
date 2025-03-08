import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@optimatech88/titomeet-shared-lib';
import { IsDate, IsEnum, IsNotEmpty, IsString } from 'class-validator';

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
  accounts: AccountDto[];
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
} 