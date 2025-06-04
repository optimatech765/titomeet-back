import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@optimatech88/titomeet-shared-lib';
import { IRequest } from 'src/types';
import { UpdateUserDto, UpdateUserStatusDto, UserInterestDto } from 'src/dto/users.dto';
import { ApiResponse } from '@nestjs/swagger';
import { UserDto } from '../dto/users.dto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'User data',
    type: UserDto,
  })
  getAuthUser(@Request() req: IRequest) {
    return this.usersService.getUserData(req.user);
  }

  @Put('me')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'User data',
    type: UserDto,
  })
  updateUser(@Request() req: IRequest, @Body() body: UpdateUserDto) {
    return this.usersService.updateUser(req.user, body);
  }

  @Patch('me/status')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'User data',
    type: UserDto,
  })
  updateUserStatus(
    @Request() req: IRequest,
    @Body() body: UpdateUserStatusDto,
  ) {
    return this.usersService.updateUserStatus(req.user, body);
  }

  @Get('me/interests')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'User interests',
    type: UserInterestDto,
  })
  getUserInterests(@Request() req: IRequest) {
    return this.usersService.getInterests(req.user);
  }

  @Post('me/interests')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'User interests',
    type: UserInterestDto,
  })
  updateUserInterests(@Request() req: IRequest, @Body() body: UserInterestDto) {
    return this.usersService.saveInterests(req.user, body);
  }
}
