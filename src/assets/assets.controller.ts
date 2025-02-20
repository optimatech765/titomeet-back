import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';
import {
  DeleteAssetsDto,
  DeleteAssetsResponseDto,
  GetPresignedResponseDto,
  GetPresignedUrlDto,
} from 'src/dto/assets.dto';
import { AuthGuard } from '@optimatech88/titomeet-shared-lib';
import { ApiResponse } from '@nestjs/swagger';

@Controller('api/assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('presigned-url')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Get presigned url to upload assets',
    type: GetPresignedResponseDto,
  })
  getPresignedUrl(@Body() payload: GetPresignedUrlDto) {
    return this.assetsService.getPresignedUrl(payload);
  }

  @Delete('delete')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Delete assets',
    type: DeleteAssetsResponseDto,
  })
  deleteAssets(@Body() payload: DeleteAssetsDto) {
    return this.assetsService.deleteAssets(payload);
  }
}
