import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { AssetsService } from 'src/assets/assets.service';

@Module({
  controllers: [EventsController],
  providers: [EventsService, AssetsService],
})
export class EventsModule {}
