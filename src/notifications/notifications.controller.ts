import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@optimatech88/titomeet-shared-lib';
import { IRequest } from 'src/types';
import { ApiResponse } from '@nestjs/swagger';
import { NotificationDto } from 'src/dto/notifications.dto';
import { PaginationQueryDto } from 'src/dto/users.dto';

@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Get all notifications',
    type: NotificationDto,
  })
  findAll(@Query() query: PaginationQueryDto, @Request() req: IRequest) {
    return this.notificationsService.findAll(query, req.user);
  }
}
