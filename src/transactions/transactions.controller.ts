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
import { TransactionsService } from './transactions.service';
import { AuthGuard } from '@optimatech88/titomeet-shared-lib';
import { IRequest } from 'src/types';
import {
  UpdateUserDto,
  UpdateUserStatusDto,
  UserInterestDto,
  UserInterestDtoPayload,
} from 'src/dto/users.dto';
import { ApiResponse } from '@nestjs/swagger';
import { UserDto } from '../dto/users.dto';
import { GetPricingsQueryDto, GetPricingsResponseDto } from 'src/dto/admin.dto';
import { SubscriptionPayloadDto } from 'src/dto/transaction.dto';

@Controller('api/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) { }

  @Get('pricings')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Pricings',
    type: GetPricingsResponseDto,
  })
  getPricings(@Query() query: GetPricingsQueryDto) {
    return this.transactionsService.getPricings(query);
  }

  @Post('subscription')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Subscription created',
    type: SubscriptionPayloadDto,
  })
  createSubscription(
    @Body() body: SubscriptionPayloadDto,
    @Request() req: IRequest,
  ) {
    return this.transactionsService.createSubscription(req.user, body);
  }
}
