import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderListener } from './listeners';
@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrderListener],
})
export class OrdersModule { }
