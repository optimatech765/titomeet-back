import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailListener } from './listeners';

@Module({
  controllers: [MailController],
  providers: [MailService, MailListener],
  exports: [MailService],
})
export class MailModule {}
