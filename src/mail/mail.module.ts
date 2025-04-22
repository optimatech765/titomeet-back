import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailListener } from './listeners';

@Module({
  providers: [MailService, MailListener],
})
export class MailModule {}
