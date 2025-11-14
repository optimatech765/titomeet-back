import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { FedapayService } from 'src/fedapay/fedapay.service';
import { TransactionsController } from './transactions.controller';
@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, FedapayService],
})
export class TransactionsModule {}
