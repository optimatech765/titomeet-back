import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  SignupDto,
  LoginDto,
  AuthenticationResponseDto,
  RefreshTokenDto,
} from '../dto/auth.dto';
import {
  JwtService,
  PrismaService,
  User,
} from '@optimatech88/titomeet-shared-lib';
import { REFRESH_TOKEN_EXPIRES_IN } from 'src/utils/constants';
import { createHash, randomUUID } from 'crypto';
import { throwServerError } from 'src/utils';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

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
}
