import { Module } from '@nestjs/common';
import { FedapayService } from './fedapay.service';
import { FedapayController } from './fedapay.controller';
@Module({
  controllers: [FedapayController],
  providers: [FedapayService],
  exports: [FedapayService],
})
export class FedapayModule {}
