import {
  Controller,
  Post,
  Body,
  Request,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProvidersService } from './providers.service';
import {
  CreateProviderDto,
  GetProvidersQueryDto,
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
    type: ProviderDto,
  })
  async getProviders(
    @Query() query: GetProvidersQueryDto,
    //@Request() req: any,
  ) {
    return this.providersService.getProviders(query);
  }
}
