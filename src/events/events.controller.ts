import {
  Body,
  Controller,
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
  EventDto,
  GetEventsResponseDto,
  UpdateEventDto,
} from 'src/dto/events.dto';
import {
  AuthGuard,
  OptionalAuthGuard,
  PaginationQuery,
} from '@optimatech88/titomeet-shared-lib';
import { IRequest } from 'src/types';
import { ApiResponse } from '@nestjs/swagger';

@Controller('api/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

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
  @ApiResponse({
    status: 200,
    description: 'Get events',
    type: GetEventsResponseDto,
  })
  getEvents(@Query() query: PaginationQuery, @Request() req: any) {
    return this.eventsService.getEvents(req.query, query, req.user);
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
}
