import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule, PrismaModule } from '@optimatech88/titomeet-shared-lib';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './users/users.module';
import { AssetsModule } from './assets/assets.module';
import { EventsModule } from './events/events.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AddressesModule } from './addresses/addresses.module';
import { ProvidersModule } from './providers/providers.module';
import { AdminModule } from './admin/admin.module';
import { FedapayModule } from './fedapay/fedapay.module';
import { OrdersModule } from './orders/orders.module';
import { MailModule } from './mail/mail.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env', // Ensure this path is correct
    }),
    PrismaModule,
    ThrottlerModule.forRoot([
      {
        ttl: 1000,
        limit: 20,
      },
    ]),
    CacheModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    AssetsModule,
    EventsModule,
    NotificationsModule,
    AddressesModule,
    ProvidersModule,
    AdminModule,
    FedapayModule,
    OrdersModule,
    MailModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
