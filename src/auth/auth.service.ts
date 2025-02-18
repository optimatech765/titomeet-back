import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SignupDto, LoginDto } from '../dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService, User } from '@tenbou/test-shared-lib';
import { REFRESH_TOKEN_EXPIRES_IN } from 'src/utils/constants';
import { createHash } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    const refreshTokenExpiresIn = Date.now() + REFRESH_TOKEN_EXPIRES_IN;
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: refreshTokenExpiresIn,
    });

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

  async signup(signupDto: SignupDto): Promise<User> {
    // Check if user already exists
    const user = await this.prisma.user.findUnique({
      where: { email: signupDto.email },
    });
    if (user) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
    // Create user
    const newUser = await this.prisma.user.create({
      data: signupDto,
      include: {
        accounts: true,
      },
    });

    const tokens = await this.generateTokens(newUser);

    return {
      ...tokens,
      user: newUser,
    };
  }

  async login(payload: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: payload.email,
        password: createHash('sha256').update(payload.password).digest('hex'),
      },
    });

    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    const tokens = await this.generateTokens(user);

    return { ...tokens, user };
  }
}
