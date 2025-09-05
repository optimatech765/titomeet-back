import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { IRequest } from 'src/types';
import { ApiResponse } from '@nestjs/swagger';
import { GetOrdersResponseDto, OrderDto } from 'src/dto/orders.dto';
import {
  AuthGuard,
  OptionalAuthGuard,
} from '@optimatech88/titomeet-shared-lib';
import { GetEventOrdersQueryDto } from 'src/dto/events.dto';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Get orders by user',
    type: GetOrdersResponseDto,
  })
  async getOrdersByUser(
    @Query() query: GetEventOrdersQueryDto,
    @Request() req: IRequest,
  ) {
    return this.ordersService.getOrdersByUser(query, req.user);
  }

  @Get(':reference')
  @UseGuards(OptionalAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Get order by id or transaction id',
    type: OrderDto,
  })
  async getOrderByReference(@Param('reference') reference: string) {
    return this.ordersService.getOrderByReference(reference);
  }
}
