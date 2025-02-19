import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@tenbou/test-shared-lib';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    private prisma: PrismaService,
  ) {}
}
