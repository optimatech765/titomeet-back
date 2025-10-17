import {
  Controller,
  Post,
  Body,
  Request,
  Get,
  Query,
  UseGuards,
  Param,
  Put,
} from '@nestjs/common';
import { ProvidersService } from './providers.service';
import {
  CreateProviderDto,
  GetProviderCategoriesResponseDto,
  GetProviderEventsQueryDto,
  GetProvidersQueryDto,
  GetProvidersResponseDto,
  ProviderCategoryQueryDto,
  ProviderDto,
  ProviderOnEventDto,
  ProviderStatsDto,
} from 'src/dto/providers.dto';
import {
  AuthGuard,
  OptionalAuthGuard,
  ProviderOnEventStatus,
} from '@optimatech88/titomeet-shared-lib';
import { ApiResponse } from '@nestjs/swagger';
import { GetEventsResponseDto } from 'src/dto/events.dto';
import { IRequest } from 'src/types';

@Controller('api/providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Create provider',
    type: ProviderDto,
  })
  async createProvider(
    @Body() payload: CreateProviderDto,
    @Request() req: any,
  ) {
    return this.providersService.createProvider(payload, req.user);
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Get providers',
    type: GetProvidersResponseDto,
  })
  async getProviders(
    @Query() query: GetProvidersQueryDto,
    @Request() req: any,
  ) {
    return this.providersService.getProviders(query, req.user);
  }

  @Get('categories')
  @UseGuards(OptionalAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Get provider categories',
    type: GetProviderCategoriesResponseDto,
  })
  async getProviderCategories(@Query() query: ProviderCategoryQueryDto) {
    return this.providersService.getProviderCategories(query);
  }

  @Get('events')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Get events for provider',
    type: GetEventsResponseDto,
  })
  async getEventsForProvider(
    @Request() req: IRequest,
    @Query() query: GetProviderEventsQueryDto,
  ) {
    return this.providersService.getEventsForProvider(req.user, query);
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Get provider by id',
    type: ProviderDto,
  })
  async getProviderById(@Param('id') id: string) {
    return this.providersService.getProviderById(id);
  }

  @Get('stats')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Get provider stats',
    type: ProviderStatsDto,
  })
  async getProviderStats(
    @Request() req: IRequest,
    @Query() query: GetProviderEventsQueryDto,
  ) {
    return this.providersService.getProviderStats(req.user, query.providerId);
  }

  @Put(':id/events/:eventId/status')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Update event request',
    type: ProviderOnEventDto,
  })
  async updateEventRequest(
    @Param('id') id: string,
    @Param('eventId') eventId: string,
    @Request() req: IRequest,
    @Body() body: { status: ProviderOnEventStatus },
  ) {
    return this.providersService.updateEventRequest(
      id,
      eventId,
      req.user,
      body.status,
    );
  }
}
