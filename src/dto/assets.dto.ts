import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';
export class GetPresignedUrlDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fileType: string;
}

export class GetPresignedResponseDto {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  success: boolean;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  uploadUrl: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  downloadUrl: string;

  @ApiProperty()
  uniqueName: string;
  filePath: string;
  fields: Record<string, string>;
}

export class DeleteAssetsDto {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  fileNames: string[];
}

export class DeleteAssetsResponseDto {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  success: boolean;
}
