import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@optimatech88/titomeet-shared-lib';
import { IsNotEmpty, IsString } from 'class-validator';

export class AccountDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresAt: Date;
  
}

export class UserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ enum: UserRole })
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