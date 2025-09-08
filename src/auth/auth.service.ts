import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  SignupDto,
  LoginDto,
  AuthenticationResponseDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdatePasswordPayloadDto,
  GoogleMobileAuthDto,
} from '../dto/auth.dto';
import {
  AccountType,
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
import axios from 'axios';

/* import backupFile from '../../backup.json';
import { writeFileSync } from 'fs'; */

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
  ) { }

  async generateTokens(user: User) {
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

  /*   async seedData() {
      try {
        this.logger.log('Seeding data...');
        const seedList = [
          'accounts',
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
          'chatUsers',
          'feedbackCategories',
          'feedbacks',
          'messages',
          'newsletters',
          'notifications',
          'orders',
          'orderItems',
          'pricings',
          'providers',
          'providerCategories',
          'providersOnEvents',
          'reviews',
          'transactions',
          'users',
          'usersInterests',
        ];
        const {
          accounts,
          addresses,
          chats,
          chatUsers,
          events,
          eventCategories,
          eventPrices,
          favorites,
          feedbacks,
          messages,
          newsletters,
          notifications,
          orders,
          orderItems,
          pricings,
          providers,
          providerCategories,
          providersOnEvents,
          reviews,
          transactions,
          users,
          usersInterests,
        } = backupFile;
  
        if (seedList.includes('users')) {
          this.logger.log('Seeding users...');
          await this.prisma.user.createMany({
            data: users.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt).toISOString(),
              updatedAt: new Date(item.updatedAt).toISOString(),
            })) as any,
            skipDuplicates: true,
          });
        }
        if (seedList.includes('accounts')) {
          this.logger.log('Seeding accounts...');
          await this.prisma.account.createMany({
            data: accounts.map((item: any) => ({
              ...item,
              expiresAt: new Date(item.expiresAt).toISOString(),
            })) as any,
            skipDuplicates: true,
          });
        }
        if (seedList.includes('addresses')) {
          this.logger.log('Seeding addresses...');
          await this.prisma.address.createMany({
            data: addresses.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt).toISOString(),
              updatedAt: new Date(item.updatedAt).toISOString(),
            })) as any,
            skipDuplicates: true,
          });
        }
        if (seedList.includes('events')) {
          this.logger.log('Seeding events...');
          await this.prisma.event.createMany({
            data: events.map((item: any) => ({
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
            data: chats.map((item: any) => ({
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
            data: chatUsers.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt).toISOString(),
              updatedAt: new Date(item.updatedAt).toISOString(),
            })) as any,
            skipDuplicates: true,
          });
        }
  
        if (seedList.includes('eventCategories')) {
          this.logger.log('Seeding event categories...');
          await this.prisma.eventCategory.createMany({
            data: eventCategories.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt).toISOString(),
              updatedAt: new Date(item.updatedAt).toISOString(),
            })) as any,
            skipDuplicates: true,
          });
        }
        if (seedList.includes('eventPrices')) {
          this.logger.log('Seeding event prices...');
          await this.prisma.eventPrice.createMany({
            data: eventPrices.map((item: any) => ({
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
            data: favorites.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt).toISOString(),
              updatedAt: new Date(item.updatedAt).toISOString(),
            })) as any,
            skipDuplicates: true,
          });
        }
        if (seedList.includes('feedbacks')) {
          this.logger.log('Seeding feedbacks...');
          await this.prisma.feedback.createMany({
            data: feedbacks.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt).toISOString(),
              updatedAt: new Date(item.updatedAt).toISOString(),
            })) as any,
            skipDuplicates: true,
          });
        }
        if (seedList.includes('messages')) {
          this.logger.log('Seeding messages...');
          await this.prisma.message.createMany({
            data: messages.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt).toISOString(),
              updatedAt: new Date(item.updatedAt).toISOString(),
            })) as any,
            skipDuplicates: true,
          });
        }
        if (seedList.includes('newsletters')) {
          this.logger.log('Seeding newsletters...');
          await this.prisma.newsletter.createMany({
            data: newsletters.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt).toISOString(),
              updatedAt: new Date(item.updatedAt).toISOString(),
            })) as any,
            skipDuplicates: true,
          });
        }
        if (seedList.includes('notifications')) {
          this.logger.log('Seeding notifications...');
          await this.prisma.notification.createMany({
            data: notifications.map((item: any) => ({
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
            data: orders.map((item: any) => ({
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
            data: orderItems.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt).toISOString(),
              updatedAt: new Date(item.updatedAt).toISOString(),
            })) as any,
            skipDuplicates: true,
          });
        }
        if (seedList.includes('pricings')) {
          this.logger.log('Seeding pricings...');
          await this.prisma.pricing.createMany({
            data: pricings.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt).toISOString(),
              updatedAt: new Date(item.updatedAt).toISOString(),
            })) as any,
            skipDuplicates: true,
          });
        }
        if (seedList.includes('providerCategories')) {
          this.logger.log('Seeding provider categories...');
          await this.prisma.providerCategory.createMany({
            data: providerCategories.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt).toISOString(),
              updatedAt: new Date(item.updatedAt).toISOString(),
            })) as any,
            skipDuplicates: true,
          });
        }
        if (seedList.includes('providers')) {
          this.logger.log('Seeding providers...');
          await this.prisma.provider.createMany({
            data: providers.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt).toISOString(),
              updatedAt: new Date(item.updatedAt).toISOString(),
            })) as any,
            skipDuplicates: true,
          });
        }
  
        if (seedList.includes('providersOnEvents')) {
          this.logger.log('Seeding providers on events...');
          await this.prisma.providerOnEvent.createMany({
            data: providersOnEvents.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt).toISOString(),
              updatedAt: new Date(item.updatedAt).toISOString(),
            })) as any,
            skipDuplicates: true,
          });
        }
        if (seedList.includes('reviews')) {
          this.logger.log('Seeding reviews...');
          await this.prisma.review.createMany({
            data: reviews.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt).toISOString(),
              updatedAt: new Date(item.updatedAt).toISOString(),
            })) as any,
            skipDuplicates: true,
          });
        }
        if (seedList.includes('transactions')) {
          this.logger.log('Seeding transactions...');
          await this.prisma.transaction.createMany({
            data: transactions.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt).toISOString(),
              updatedAt: new Date(item.updatedAt).toISOString(),
            })) as any,
            skipDuplicates: true,
          });
        }
  
        if (seedList.includes('usersInterests')) {
          this.logger.log('Seeding users interests...');
          await this.prisma.userInterests.createMany({
            data: usersInterests.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt).toISOString(),
              updatedAt: new Date(item.updatedAt).toISOString(),
            })) as any,
            skipDuplicates: true,
          });
        }
        this.logger.log('Data seeded successfully');
        return { message: 'Data seeded successfully' };
      } catch (error) {
        this.logger.error(error);
        throwServerError(error);
      }
    }
  
    async backupData() {
      try {
        this.logger.log('Backup data...');
  
        const accounts = await this.prisma.account.findMany();
        const addresses = await this.prisma.address.findMany();
  
        const chats = await this.prisma.chat.findMany();
  
        const chatUsers = await this.prisma.chatUser.findMany();
        const events = await this.prisma.event.findMany();
  
        const eventCategories = await this.prisma.eventCategory.findMany();
        const eventPrices = await this.prisma.eventPrice.findMany();
  
        const favorites = await this.prisma.favorite.findMany();
        const feedbacks = await this.prisma.feedback.findMany();
  
        const messages = await this.prisma.message.findMany();
  
        const newsletters = await this.prisma.newsletter.findMany();
  
        const notifications = await this.prisma.notification.findMany();
  
        const orders = await this.prisma.order.findMany();
  
        const orderItems = await this.prisma.orderItem.findMany();
        const pricings = await this.prisma.pricing.findMany();
  
        const providers = await this.prisma.provider.findMany();
        const providerCategories = await this.prisma.providerCategory.findMany();
  
        const providersOnEvents = await this.prisma.providerOnEvent.findMany();
  
        const reviews = await this.prisma.review.findMany();
        const transactions = await this.prisma.transaction.findMany();
        const users = await this.prisma.user.findMany();
        const usersInterests = await this.prisma.userInterests.findMany();
  
        //save to json file
        writeFileSync(
          'backup.json',
          JSON.stringify(
            {
              accounts,
              addresses,
              chats,
              chatUsers,
              events,
              eventCategories,
              eventPrices,
              favorites,
              feedbacks,
              messages,
              newsletters,
              notifications,
              orders,
              orderItems,
              pricings,
              providers,
              providerCategories,
              providersOnEvents,
              reviews,
              transactions,
              users,
              usersInterests,
            },
            null,
            2,
          ),
        );
  
        this.logger.log('Data backed up successfully');
        return { message: 'Data backed up successfully' };
      } catch (error) {
        this.logger.error(error);
        throwServerError(error);
      }
    } */

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

  //authenticate mobile
  async googleAuth(
    payload: GoogleMobileAuthDto,
  ): Promise<{ access_token: string; user: User }> {
    try {
      const { idToken } = payload;
      const { data } = await axios.request({
        method: 'get',
        url: `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`,
        withCredentials: true,
      });

      const user = data as {
        email: string;
        given_name: string;
        family_name: string;
        picture: string;
        sub: string;
      };

      const email = user.email;

      //check if user with same email exists loggin otherwise create and send data

      let existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      let tokens = existingUser
        ? await this.generateTokens(existingUser)
        : { accessToken: null, refreshToken: null };

      if (!existingUser) {
        //create user

        existingUser = await this.prisma.user.create({
          data: {
            email,
            username: email,
            firstName: user.given_name,
            lastName: user.family_name,
            profilePicture: user.picture,
            password: '-',
          },
        });
        tokens = await this.generateTokens(existingUser);

        await this.prisma.account.create({
          data: {
            type: AccountType.GOOGLE,
            reference: user.sub,
            userId: existingUser.id,
            refreshToken: tokens.refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN),
          },
        });

      }

      const access_token = tokens?.accessToken ?? '';

      return {
        access_token,
        user: existingUser,
      };
    } catch (error) {
      this.logger.error(error);
      //check if error is not thrown from async operation
      if (error.status) {
        throw error;
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
