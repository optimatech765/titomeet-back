import { Controller, Post, Body } from '@nestjs/common';
import { FedapayService } from './fedapay.service';

@Controller('api/fedapay')
export class FedapayController {
  constructor(private readonly fedapayService: FedapayService) {}

  @Post('webhook')
  webhook(@Body() payload: any) {
    return this.fedapayService.webhook(payload);
  }
}
