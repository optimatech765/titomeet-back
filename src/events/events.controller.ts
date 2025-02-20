import { Body, Controller, Post, Put, Request, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from 'src/dto/events.dto';
import { AuthGuard } from '@optimatech88/titomeet-shared-lib';
import { IRequest } from 'src/types';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(AuthGuard)
  createEvent(@Body() payload: CreateEventDto, @Request() req: IRequest) {
    return this.eventsService.createEvent(payload, req.user);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  updateEvent(@Body() payload: UpdateEventDto, @Request() req: IRequest) {
    return this.eventsService.updateEvent(payload, req.user);
  }
}
