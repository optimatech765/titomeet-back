import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  SignupDto,
  LoginDto,
  AuthenticationResponseDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdatePasswordPayloadDto,
} from '../dto/auth.dto';
import {
  JwtService,
  PrismaService,
  User,
} from '@optimatech88/titomeet-shared-lib';
import { REFRESH_TOKEN_EXPIRES_IN } from 'src/utils/constants';
import { createHash, randomUUID } from 'crypto';
import { throwServerError } from 'src/utils';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MAIL_EVENTS } from 'src/utils/events';
import { ForgotPasswordEvent } from 'src/mail/events';

import mainData from '../utils/seed/main.json';
import eventsData from '../utils/seed/events.json';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
  ) { }

  private async generateTokens(user: User) {
    const payload = { userId: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1d',
      secret: process.env.JWT_SECRET,
    });
    const refreshTokenExpiresIn = Date.now() + REFRESH_TOKEN_EXPIRES_IN;
    const refreshToken = `rfr-${randomUUID()}`;

    const account = await this.prisma.account.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!account) {
      await this.prisma.account.create({
        data: {
          userId: user.id,
          refreshToken,
          expiresAt: new Date(refreshTokenExpiresIn),
        },
      });
    }

    return { accessToken, refreshToken };
  }

  async signup(signupDto: SignupDto): Promise<AuthenticationResponseDto> {
    try {
      // Check if user already exists
      const user = await this.prisma.user.findUnique({
        where: { email: signupDto.email },
        include: {
          accounts: true,
        },
      });
      if (user) {
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      }

      // Check if username already exists
      const username = await this.prisma.user.findUnique({
        where: { username: signupDto.username },
      });
      if (username) {
        throw new HttpException(
          'Username already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Create user
      const newUser = await this.prisma.user.create({
        data: {
          ...signupDto,
          password: createHash('sha256')
            .update(signupDto.password)
            .digest('hex'),
        },
        include: {
          accounts: true,
        },
      });

      const tokens = await this.generateTokens(newUser);

      return {
        ...tokens,
        user: newUser,
      };
    } catch (error) {
      this.logger.error(error);
      return throwServerError(error);
    }
  }

  async login(payload: LoginDto): Promise<AuthenticationResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: payload.email,
          password: createHash('sha256').update(payload.password).digest('hex'),
        },
        include: {
          accounts: true,
        },
      });

      if (!user) {
        throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
      }

      const tokens = await this.generateTokens(user);

      return { ...tokens, user };
    } catch (error) {
      this.logger.error(error);
      return throwServerError(error);
    }
  }

  async refreshToken(payload: RefreshTokenDto) {
    try {
      const account = await this.prisma.account.findUnique({
        where: { refreshToken: payload.refreshToken },
      });

      if (!account) {
        throw new HttpException(
          'Invalid refresh token',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (account.expiresAt < new Date()) {
        throw new HttpException(
          'Refresh token expired',
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.prisma.user.findUnique({
        where: { id: account.userId },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
      }

      const tokens = await this.generateTokens(user);

      return { ...tokens, user };
    } catch (error) {
      this.logger.error(error);
      return throwServerError(error);
    }
  }

  //integrate password forgot and reset
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: forgotPasswordDto.email },
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
      }

      const token = this.jwtService.sign(
        { userId: user.id, email: user.email, type: 'forgot_password' },
        {
          expiresIn: '1d',
          secret: process.env.JWT_SECRET,
        },
      );
      //send welcome message
      const forgotPasswordEvent = new ForgotPasswordEvent();
      forgotPasswordEvent.email = user.email;
      forgotPasswordEvent.username = user.username;
      forgotPasswordEvent.token = token;
      this.eventEmitter.emit(MAIL_EVENTS.FORGOT_PASSWORD, forgotPasswordEvent);
      return { message: 'Email envoyé avec succès' };
    } catch (error) {
      this.logger.error(error);
      return throwServerError(error);
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const { token, password } = resetPasswordDto;
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      if (!decoded) {
        throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
      }
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
      }

      if (decoded.type !== 'forgot_password') {
        throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
      }
      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: createHash('sha256').update(password).digest('hex') },
      });
      return { message: 'Mot de passe réinitialisé avec succès' };
    } catch (error) {
      this.logger.error(error);
      return throwServerError(error);
    }
  }

  async seedData() {
    try {
      this.logger.log('Seeding data...');
      const seedList = [
        /* 'accounts',
        'addresses', 
        'eventCategories',
        'providerCategories',
        'providers',
        'events',
        'eventPrices',
        'favorites',
        'orders',
        'orderItems',
        'chats',
        'chatUsers', */
        'feedbackCategories'
      ];
      const {
        users,
        accounts,
        addresses,
        eventCategories,
        providerCategories,
        providers,
        favorites,
        orders,
        orderItems,
        chats,
        chatUsers,
        eventPrices,
      } = mainData;

      const events = eventsData as any;

      if (seedList.includes('addresses')) {
        this.logger.log('Seeding addresses...');
        await this.prisma.address.createMany({
          data: addresses.map((item) => ({
            ...item,
            createdAt: new Date(item.createdAt).toISOString(),
            updatedAt: new Date(item.updatedAt).toISOString(),
          })) as any,
          skipDuplicates: true,
        });
      }
      if (seedList.includes('users')) {
        this.logger.log('Seeding users...');
        await this.prisma.user.createMany({
          data: users.map((item) => ({
            ...item,
            createdAt: new Date(item.createdAt).toISOString(),
            updatedAt: new Date(item.updatedAt).toISOString(),
          })) as any,
        });
      }
      if (seedList.includes('accounts')) {
        this.logger.log('Seeding accounts...');
        await this.prisma.account.createMany({
          data: accounts.map((item) => ({
            ...item,
            expiresAt: new Date(item.expiresAt).toISOString(),
          })) as any,
          skipDuplicates: true,
        });
      }
      if (seedList.includes('eventCategories')) {
        this.logger.log('Seeding event categories...');
        await this.prisma.eventCategory.createMany({
          data: eventCategories.map((item) => ({
            ...item,
            createdAt: new Date(item.createdAt || new Date()).toISOString(),
            updatedAt: new Date(item.updatedAt || new Date()).toISOString(),
          })) as any,
          skipDuplicates: true,
        });
      }


      if (seedList.includes('providerCategories')) {
        this.logger.log('Seeding providers categories...');
        for (const parentCategory of providerCategories) {
          // Create or update parent category
          const parent = await this.prisma.providerCategory.upsert({
            where: { name: parentCategory.name },
            update: {},
            create: {
              name: parentCategory.name,
              description: parentCategory.description,
            },
          });

          const children = (parentCategory.children ?? []) as string[];

          // Create child categories
          for (const childName of children) {
            await this.prisma.providerCategory.upsert({
              where: { name: childName },
              update: {},
              create: {
                name: childName,
                description: ``,
                parent: {
                  connect: {
                    id: parent.id,
                  },
                },
              },
            });
          }
        }
        /* await this.prisma.provider.createMany({
          data: providers.map((item) => ({
            ...item,
            createdAt: new Date(item.createdAt).toISOString(),
            updatedAt: new Date(item.updatedAt).toISOString(),
          })) as any,
          skipDuplicates: true,
        }); */
      }

      if (seedList.includes('providers')) {
        this.logger.log('Seeding providers...');
        await this.prisma.provider.createMany({
          data: providers.map((item) => item) as any,
          skipDuplicates: true,
        });
      }

      if (seedList.includes('events')) {
        this.logger.log('Seeding events...');
        await this.prisma.event.createMany({
          data: events.map((item: any) => ({
            ...item,
            startDate: new Date(item.startDate).toISOString(),
            endDate: new Date(item.endDate).toISOString(),
            createdAt: new Date(item.createdAt).toISOString(),
            updatedAt: new Date(item.updatedAt).toISOString(),
          })) as any,
          skipDuplicates: true,
        });
      }
      if (seedList.includes('eventPrices')) {
        this.logger.log('Seeding event prices...');
        await this.prisma.eventPrice.createMany({
          data: eventPrices.map((item) => ({
            ...item,
            createdAt: new Date(item.createdAt).toISOString(),
            updatedAt: new Date(item.updatedAt).toISOString(),
          })) as any,
          skipDuplicates: true,
        });
      }
      if (seedList.includes('favorites')) {
        this.logger.log('Seeding favorites...');
        await this.prisma.favorite.createMany({
          data: favorites.map((item) => ({
            ...item,
            createdAt: new Date(item.createdAt).toISOString(),
            updatedAt: new Date(item.updatedAt).toISOString(),
          })) as any,
          skipDuplicates: true,
        });
      }
      if (seedList.includes('orders')) {
        this.logger.log('Seeding orders...');
        await this.prisma.order.createMany({
          data: orders.map((item) => ({
            ...item,
            createdAt: new Date(item.createdAt).toISOString(),
            updatedAt: new Date(item.updatedAt).toISOString(),
          })) as any,
          skipDuplicates: true,
        });
      }
      if (seedList.includes('orderItems')) {
        this.logger.log('Seeding order items...');
        await this.prisma.orderItem.createMany({
          data: orderItems.map((item) => ({
            ...item,
            createdAt: new Date(item.createdAt).toISOString(),
            updatedAt: new Date(item.updatedAt).toISOString(),
          })) as any,
          skipDuplicates: true,
        });
      }
      if (seedList.includes('chats')) {
        this.logger.log('Seeding chats...');
        await this.prisma.chat.createMany({
          data: chats.map((item) => ({
            ...item,
            createdAt: new Date(item.createdAt).toISOString(),
            updatedAt: new Date(item.updatedAt).toISOString(),
          })) as any,
          skipDuplicates: true,
        });
      }
      if (seedList.includes('chatUsers')) {
        this.logger.log('Seeding chat users...');
        await this.prisma.chatUser.createMany({
          data: chatUsers.map((item) => ({
            ...item,
            createdAt: new Date(item.createdAt).toISOString(),
            updatedAt: new Date(item.updatedAt).toISOString(),
          })) as any,
          skipDuplicates: true,
        });
        this.logger.log('Seeded Data!!');
        return { message: 'Data seeded successfully' };
        /* this.logger.log('Seeding messages...');
        await this.prisma.message.createMany({
          data: messages,
        }); */
      }
    } catch (error) {
      this.logger.error(error);
      throwServerError(error);
    }
  }

  async updatePassword(payload: UpdatePasswordPayloadDto, authUser: User) {
    try {
      const { oldPassword, newPassword } = payload;
      const user = await this.prisma.user.findUnique({
        where: { id: authUser.id },
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
      }
      if (
        user.password !== createHash('sha256').update(oldPassword).digest('hex')
      ) {
        throw new HttpException('Invalid old password', HttpStatus.BAD_REQUEST);
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: createHash('sha256').update(newPassword).digest('hex'),
        },
      });
      return { message: 'Mot de passe mis à jour avec succès' };
    } catch (error) {
      this.logger.error(error);
      return throwServerError(error);
    }
  }
}
