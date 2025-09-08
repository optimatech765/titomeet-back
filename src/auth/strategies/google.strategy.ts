import { Inject, Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PrismaService } from '@optimatech88/titomeet-shared-lib';
import { ConfigType } from '@nestjs/config';
import googleOAuthConfig from 'src/config/google.config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  private logger = new Logger('GoogleStrategy');
  constructor(
    private prisma: PrismaService,
    @Inject(googleOAuthConfig.KEY)
    private googleConfig: ConfigType<typeof googleOAuthConfig>,
  ) {
    super({
      clientID: googleConfig.clientID ?? '',
      clientSecret: googleConfig.clientSecret ?? '',
      callbackURL: googleConfig.callbackUrl ?? '',
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    try {
      const email = profile.emails[0].value;
      //check if user exists
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (user) {
        done(null, user);
      } else {
        const newUser = await this.prisma.user.create({
          data: {
            username: email,
            email,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            profilePicture: profile.photos[0].value,
            password: '-',
          },
        });
        done(null, newUser);
      }
    } catch (error) {
      this.logger.error(error);
      done(error);
    }
  }
}
