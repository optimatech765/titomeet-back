import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  EventCategoryDto,
  EventDto,
  UpdateEventCategoryDto,
} from 'src/dto/events.dto';
import { AdminAuthGuard } from '@optimatech88/titomeet-shared-lib';
import { ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import {
  AdminStatsDto,
  CreateEventCategoryDto,
  CreateProviderCategoryDto,
  EventStatsDto,
  GetFeedbacksQueryDto,
  GetFeedbacksResponseDto,
  GetUsersQueryDto,
  PricingBaseDto,
  PricingDto,
  UpdateEventStatusDto,
} from 'src/dto/admin.dto';
import {
  ProviderCategoryDto,
  UpdateProviderCategoryDto,
  ProviderDto,
  ValidateProviderDto,
} from 'src/dto/providers.dto';
import { UserDto } from 'src/dto/users.dto';
import { GetNewsletterSubscriptions, NewsLetterDto } from 'src/dto/mail.dto';

@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get('stats')
  @UseGuards(AdminAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Get admin stats',
    type: AdminStatsDto,
  })
  getAdminStats() {
    return this.adminService.getAdminStats();
  }

  @Get('events/stats')
  @UseGuards(AdminAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Get event stats',
    type: EventStatsDto,
  })
  getEventStats() {
    return this.adminService.getEventStats();
  }

  @Post('events/categories')
  @UseGuards(AdminAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Create event category',
    type: EventCategoryDto,
  })
  createEventCategory(@Body() payload: CreateEventCategoryDto) {
    return this.adminService.createEventCategory(payload);
  }

  @Put('events/categories/:id')
  @UseGuards(AdminAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Update event category',
    type: EventCategoryDto,
  })
  updateEventCategory(
    @Param('id') id: string,
    @Body() payload: UpdateEventCategoryDto,
  ) {
    return this.adminService.updateEventCategory(id, payload);
  }

  @Put('events/:id/status')
  @UseGuards(AdminAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Update event status',
    type: EventDto,
  })
  updateEventStatus(
    @Param('id') id: string,
    @Body() payload: UpdateEventStatusDto,
  ) {
    return this.adminService.updateEventStatus(id, payload);
  }

  @Post('providers/categories')
  @UseGuards(AdminAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Create provider category',
    type: ProviderCategoryDto,
  })
  createProviderCategory(@Body() payload: CreateProviderCategoryDto) {
    return this.adminService.createProviderCategory(payload);
  }

  @Put('providers/categories/:id')
  @UseGuards(AdminAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Update provider category',
    type: ProviderCategoryDto,
  })
  updateProviderCategory(@Body() payload: UpdateProviderCategoryDto) {
    return this.adminService.updateProviderCategory(payload);
  }

  @Put('providers/:id/status')
  @UseGuards(AdminAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Update provider status',
    type: ProviderDto,
  })
  updateProviderStatus(
    @Param('id') id: string,
    @Body() payload: ValidateProviderDto,
  ) {
    return this.adminService.updateProviderStatus(id, payload);
  }

  @Get('users')
  @UseGuards(AdminAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Get users',
    type: UserDto,
  })
  getUsers(@Query() query: GetUsersQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Get('newsletter/subscriptions')
  @UseGuards(AdminAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Get newsletter subscriptions',
    type: NewsLetterDto,
  })
  getNewsletterSubscriptions(@Query() query: GetNewsletterSubscriptions) {
    return this.adminService.getNewsletterSubscriptions(query);
  }

  @Post('pricings')
  @UseGuards(AdminAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Create pricing',
    type: PricingDto,
  })
  createPricing(@Body() payload: PricingBaseDto) {
    return this.adminService.createPricing(payload);
  }

  @Put('pricings/:id')
  @UseGuards(AdminAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Update pricing',
    type: PricingDto,
  })
  updatePricing(@Param('id') id: string, @Body() payload: PricingBaseDto) {
    return this.adminService.updatePricing(id, payload);
  }

  @Get('feedbacks')
  @UseGuards(AdminAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Get feedbacks',
    type: GetFeedbacksResponseDto,
  })
  getFeedbacks(@Query() query: GetFeedbacksQueryDto) {
    return this.adminService.getFeedbacks(query);
  }
}
