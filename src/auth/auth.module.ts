import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthModule as SharedAuthModule } from '@optimatech88/titomeet-shared-lib';
import { ACCESS_TOKEN_EXPIRES_IN } from 'src/utils/constants';
import { ConfigModule } from '@nestjs/config';
import googleOAuthConfig from 'src/config/google.config';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    ConfigModule.forFeature(googleOAuthConfig),
    SharedAuthModule.forRoot({
      jwtSecret: process.env.JWT_SECRET ?? '',
      jwtExpiresIn: ACCESS_TOKEN_EXPIRES_IN,
    }),
  ],
  controllers: [AuthController],
  providers: [GoogleStrategy, AuthService],
})
export class AuthModule {}
