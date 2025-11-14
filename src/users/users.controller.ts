import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  AuthGuard,
  OptionalAuthGuard,
} from '@optimatech88/titomeet-shared-lib';
import { IRequest } from 'src/types';
import {
  FeedbackBaseDto,
  FeedbackDto,
  UpdateUserDto,
  UpdateUserStatusDto,
  UserInterestDto,
  UserInterestDtoPayload,
} from 'src/dto/users.dto';
import { ApiResponse } from '@nestjs/swagger';
import { UserDto } from '../dto/users.dto';
import { GetPricingsQueryDto, GetPricingsResponseDto } from 'src/dto/admin.dto';
import {
  SubscriptionPayloadDto,
  TransactionDto,
} from 'src/dto/transaction.dto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
  updateUserInterests(
    @Request() req: IRequest,
    @Body() body: UserInterestDtoPayload,
  ) {
    return this.usersService.saveInterests(req.user, body);
  }

  @Get('pricings')
  @UseGuards(OptionalAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Pricings',
    type: GetPricingsResponseDto,
  })
  getPricings(@Query() query: GetPricingsQueryDto, @Request() req: any) {
    return this.usersService.getPricings(query, req.user);
  }

  @Post('feedbacks')
  @UseGuards(OptionalAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Create feedback',
    type: FeedbackDto,
  })
  createFeedback(@Request() req: IRequest, @Body() body: FeedbackBaseDto) {
    return this.usersService.createFeedback(body, req.user);
  }
}
