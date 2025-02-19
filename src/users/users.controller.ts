import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@tenbou/test-shared-lib';
import { IRequest } from 'src/types';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  getAuthUser(@Request() req: IRequest) {
    return this.usersService.getUserData(req.user);
  }
}
