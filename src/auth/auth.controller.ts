import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiResponse } from '@nestjs/swagger';
import {
  AuthenticationResponseDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  ResetPasswordDto,
  ResetPasswordResponseDto,
  SignupDto,
} from 'src/dto/auth.dto';

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

  /*   @Get('api/auth/seed')
    seedData() {
      return this.authService.seedData();
    } */
}
