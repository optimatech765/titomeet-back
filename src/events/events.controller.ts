import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import {
  CreateEventDto,
  EventCategoryDto,
  EventCategoryQueryDto,
  EventDto,
  GetEventsQueryDto,
  GetEventsResponseDto,
  UpdateEventDto,
  GetEventOrdersQueryDto,
  GetEventsParticipantsQueryDto,
  GetEventsParticipantsResponseDto,
} from 'src/dto/events.dto';
import {
  CreateOrderDto,
  OrderEventResponseDto,
  GetEventOrdersResponseDto,
} from 'src/dto/orders.dto';
import {
  AuthGuard,
  AdminAuthGuard,
  OptionalAuthGuard,
} from '@optimatech88/titomeet-shared-lib';
import { IRequest } from 'src/types';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';

@Controller('api/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('categories')
  @UseGuards(OptionalAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Get event categories',
    type: EventCategoryDto,
  })
  getEventCategories(@Query() query: EventCategoryQueryDto) {
    return this.eventsService.getEventCategories(query);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Create event',
    type: EventDto,
  })
  createEvent(@Body() payload: CreateEventDto, @Request() req: IRequest) {
    return this.eventsService.createEvent(payload, req.user);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Update event',
    type: EventDto,
  })
  updateEvent(@Body() payload: UpdateEventDto, @Request() req: IRequest) {
    return this.eventsService.updateEvent(payload, req.user);
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiQuery({
    name: 'categories',
    type: [String],
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Get events',
    type: GetEventsResponseDto,
  })
  getEvents(@Query() query: GetEventsQueryDto, @Request() req: any) {
    return this.eventsService.getEvents(query, req.user);
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Get event by id',
    type: EventDto,
  })
  getEventById(@Param('id') id: string, @Request() req: any) {
    return this.eventsService.getEventById(id, req.user);
  }

  @Post(':id/toggle-favorite')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Toggle favorite',
  })
  toggleFavorite(@Param('id') id: string, @Request() req: IRequest) {
    return this.eventsService.toggleFavorite(id, req.user);
  }

  @Post(':id/orders')
  @UseGuards(OptionalAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Buy event tickets',
    type: OrderEventResponseDto,
  })
  orderEvent(@Body() payload: CreateOrderDto, @Request() req: any) {
    return this.eventsService.createOrder(payload, req.user);
  }

  @Get(':id/orders')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Get event orders',
    type: GetEventOrdersResponseDto,
  })
  getEventOrders(
    @Param('id') id: string,
    @Query() query: GetEventOrdersQueryDto,
  ) {
    return this.eventsService.getEventOrders(id, query);
  }

  @Get(':id/participants')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Get event participants',
    type: GetEventsParticipantsResponseDto,
  })
  getEventParticipants(
    @Param('id') id: string,
    @Query() query: GetEventsParticipantsQueryDto,
  ) {
    return this.eventsService.getEventParticipants(id, query);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  remove(@Param('id') id: string, @Request() req: IRequest) {
    return this.eventsService.deleteEvent(id, req.user);
  }
}
