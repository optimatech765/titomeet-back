import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import {
  AuthenticationResponseDto,
  ForgotPasswordDto,
  GoogleMobileAuthDto,
  LoginDto,
  RefreshTokenDto,
  ResetPasswordDto,
  ResetPasswordResponseDto,
  SignupDto,
  UpdatePasswordPayloadDto,
  UpdatePasswordResponseDto,
} from 'src/dto/auth.dto';
import { IRequest } from 'src/types';
import { AuthGuard, AdminAuthGuard } from '@optimatech88/titomeet-shared-lib';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { Response } from 'express';

@Controller('')
export class AuthController {
  constructor(private authService: AuthService) { }

  //signup
  @Post('api/auth/signup')
  @ApiResponse({
    status: 200,
    description: 'Signup user',
    type: AuthenticationResponseDto,
  })
  signup(@Body() createUseDto: SignupDto) {
    return this.authService.signup(createUseDto);
  }

  //login
  @Post('api/auth/signin')
  @ApiResponse({
    status: 200,
    description: 'Login user',
    type: AuthenticationResponseDto,
  })
  signin(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  //refresh token
  @Post('api/auth/refresh')
  @ApiResponse({
    status: 200,
    description: 'Get new access and refresh token',
    type: AuthenticationResponseDto,
  })
  refreshToken(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body);
  }

  //forgot password
  @Post('api/auth/forgot-password')
  @ApiResponse({
    status: 200,
    description: 'Forgot password',
    type: ResetPasswordResponseDto,
  })
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body);
  }

  //reset password
  @Post('api/auth/reset-password')
  @ApiResponse({
    status: 200,
    description: 'Reset password',
    type: ResetPasswordResponseDto,
  })
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  //update password
  @Post('api/auth/update-password')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Update password',
    type: UpdatePasswordResponseDto,
  })
  updatePassword(@Body() body: UpdatePasswordPayloadDto, @Req() req: IRequest) {
    return this.authService.updatePassword(body, req.user);
  }

  @Get('auth/google/login')
  @UseGuards(GoogleAuthGuard)
  googleLogin() { }

  @Get('auth/google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Request() req: IRequest, @Res() res: Response) {
    const token = await this.authService.generateTokens(req.user);
    res.redirect(
      `${process.env.FRONTEND_URL}/auth?token=${token.accessToken}&refreshToken=${token.refreshToken}`,
    );
  }

  //google mobile auth
  @Post('api/auth/google/login')
  @ApiResponse({
    status: 200,
    description: 'Access token and user data',
    type: AuthenticationResponseDto,
  })
  googleAuth(@Body() body: GoogleMobileAuthDto) {
    return this.authService.googleAuth(body);
  }

  @Post('api/database/seed')
  @UseGuards(AdminAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'JSON file containing seed data',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Seed data from JSON file',
  })
  async seedData(@UploadedFile() file: { buffer?: Buffer }) {
    const fileBuffer = file?.buffer;
    return this.authService.seedData(fileBuffer);
  }

  @Get('api/database/backup')
  @UseGuards(AdminAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Download database backup as JSON file',
  })
  async backupData(@Res() res: Response) {
    const backupData = await this.authService.backupData();
    console.log(backupData);
    const jsonString = JSON.stringify(backupData, null, 2);
    const filename = `backup-${new Date().toISOString().split('T')[0]}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(jsonString);
  }
}
