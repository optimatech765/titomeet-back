import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiResponse } from '@nestjs/swagger';
import {
  AuthenticationResponseDto,
  LoginDto,
  SignupDto,
} from 'src/dto/auth.dto';

@Controller('')
export class AuthController {
  constructor(private authService: AuthService) {}

  //signup
  @Post('api/auth/signup')
  @ApiResponse({
    status: 200,
    description: 'Access token and user data',
    type: AuthenticationResponseDto,
  })
  signup(@Body() createUseDto: SignupDto) {
    return this.authService.signup(createUseDto);
  }

  //login
  @Post('api/auth/signin')
  @ApiResponse({
    status: 200,
    description: 'Access token and user data',
    type: AuthenticationResponseDto,
  })
  signin(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
}
