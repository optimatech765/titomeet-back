import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService, User } from '@optimatech88/titomeet-shared-lib';
import { UpdateUserDto } from '../dto/users.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(private prisma: PrismaService) {}

  async getUserData(user: User) {
    try {
      const userData = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: {
          accounts: true,
        },
      });
      return userData;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUser(user: User, payload: UpdateUserDto) {
    try {
      if (payload.username !== user.username) {
        const existingUser = await this.prisma.user.findUnique({
          where: { username: payload.username },
        });
        if (existingUser) {
          throw new HttpException(
            'Username already exists',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          ...payload,
          email: user.email,
          password: user.password,
        },
        include: {
          accounts: true,
        },
      });
      return updatedUser;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
