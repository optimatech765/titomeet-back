import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { IRequest } from 'src/types';
import { OptionalAuthGuard } from 'src/guards/optional-auth.guard';
import { ApiResponse } from '@nestjs/swagger';
import { OrderDto } from 'src/dto/orders.dto';

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
