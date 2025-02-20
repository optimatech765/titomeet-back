import { Body, Controller, Get, Put, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@optimatech88/titomeet-shared-lib';
import { IRequest } from 'src/types';
import { UpdateUserDto } from 'src/dto/users.dto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  getAuthUser(@Request() req: IRequest) {
    return this.usersService.getUserData(req.user);
  }

  @Put('me')
  @UseGuards(AuthGuard)
  updateUser(@Request() req: IRequest, @Body() body: UpdateUserDto) {
    return this.usersService.updateUser(req.user, body);
  }
}
