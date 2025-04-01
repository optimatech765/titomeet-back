import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { EventCategoryDto, UpdateEventCategoryDto } from 'src/dto/events.dto';
import { AdminAuthGuard } from '@optimatech88/titomeet-shared-lib';
import { ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import {
  AdminStatsDto,
  CreateEventCategoryDto,
  CreateProviderCategoryDto,
} from 'src/dto/admin.dto';
import {
  ProviderCategoryDto,
  UpdateProviderCategoryDto,
} from 'src/dto/providers.dto';

@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
}
