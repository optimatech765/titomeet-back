
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@tenbou/test-shared-lib';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
