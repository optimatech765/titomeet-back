import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthModule as SharedAuthModule } from '@optimatech88/titomeet-shared-lib';
import { ACCESS_TOKEN_EXPIRES_IN } from 'src/utils/constants';

@Module({
  imports: [
    SharedAuthModule.forRoot({
      jwtSecret: process.env.JWT_SECRET ?? '',
      jwtExpiresIn: ACCESS_TOKEN_EXPIRES_IN,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
