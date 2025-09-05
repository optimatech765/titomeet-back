import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { AssetsService } from 'src/assets/assets.service';
import { FedapayService } from 'src/fedapay/fedapay.service';
@Module({
  controllers: [EventsController],
  providers: [EventsService, AssetsService, FedapayService],
})
export class EventsModule {}
