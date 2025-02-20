import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { GetPresignedUrlDto } from 'src/dto/assets.dto';
import { AuthGuard } from '@optimatech88/titomeet-shared-lib';

@Controller('api/assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('presigned-url')
  @UseGuards(AuthGuard)
  getPresignedUrl(@Body() payload: GetPresignedUrlDto) {
    return this.assetsService.getPresignedUrl(payload);
  }
}
