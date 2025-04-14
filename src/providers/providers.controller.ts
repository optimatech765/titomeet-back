import {
  Controller,
  Post,
  Body,
  Request,
  Get,
  Query,
  UseGuards,
  Param,
} from '@nestjs/common';
import { ProvidersService } from './providers.service';
import {
  CreateProviderDto,
  GetProviderCategoriesResponseDto,
  GetProvidersQueryDto,
  GetProvidersResponseDto,
  ProviderCategoryQueryDto,
  ProviderDto,
} from 'src/dto/providers.dto';
import {
  AuthGuard,
  OptionalAuthGuard,
} from '@optimatech88/titomeet-shared-lib';
import { ApiResponse } from '@nestjs/swagger';

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
    //@Request() req: any,
  ) {
    return this.providersService.getProviders(query);
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
}
