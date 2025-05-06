import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { IRequest } from 'src/types';
import { ApiResponse } from '@nestjs/swagger';
import { OrderDto } from 'src/dto/orders.dto';
import { OptionalAuthGuard } from '@optimatech88/titomeet-shared-lib';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get(':reference')
  @UseGuards(OptionalAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Get order by id or transaction id',
    type: OrderDto,
  })
  async getOrderByReference(
    @Param('reference') reference: string,
    @Request() req: IRequest,
  ) {
    return this.ordersService.getOrderByReference(reference);
  }
}
