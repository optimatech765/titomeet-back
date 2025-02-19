import { Injectable, Logger } from '@nestjs/common';
import { PrismaService, User } from '@tenbou/test-shared-lib';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(private prisma: PrismaService) {}

  async getUserData(user: User) {
    const userData = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        accounts: true,
      },
    });
    return userData;
  }
}
