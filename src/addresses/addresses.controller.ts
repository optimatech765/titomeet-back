import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { SearchAddressDto, GetAddressesResponseDto } from 'src/dto/address.dto';
import { OptionalAuthGuard } from '@optimatech88/titomeet-shared-lib';
import { ApiResponse } from '@nestjs/swagger';

@Controller('api/addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Get addresses',
    type: GetAddressesResponseDto,
  })
  async find(@Query() query: SearchAddressDto) {
    return this.addressesService.find(query);
  }
}