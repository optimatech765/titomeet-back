import {
  IsNumber,
  IsString,
  ValidateNested,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OrderStatus, PaymentStatus } from '@optimatech88/titomeet-shared-lib';
import { UserDto } from './users.dto';
import { EventDto } from './events.dto';

export class OrderItemPayloadDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  priceId: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiProperty({ type: [OrderItemPayloadDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemPayloadDto)
  items: OrderItemPayloadDto[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  callbackUrl: string;
}

export class OrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  totalAmount: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status: OrderStatus;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  paymentStatus: PaymentStatus;

  @ApiProperty()
  @IsString()
  @IsOptional()
  paymentIntentId?: string | null;

  @ApiProperty({ type: UserDto })
  @IsObject()
  @IsOptional()
  user: UserDto | null;
}

export class OrderItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  eventPriceId: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  unitPrice: number;
}

export class TransactionDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class CreateTransactionPaymentLinkDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class FreeEventOrderResponseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class OrderEventResponseDto {
  @ApiProperty({
    oneOf: [
      { type: 'object', $ref: getSchemaPath(CreateTransactionPaymentLinkDto) },
      { type: 'object', $ref: getSchemaPath(FreeEventOrderResponseDto) },
    ],
  })
  @IsObject()
  @IsNotEmpty()
  data: CreateTransactionPaymentLinkDto | FreeEventOrderResponseDto;
}

export class GetEventOrdersResponseDto {
  @ApiProperty({ type: [OrderDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderDto)
  items: OrderDto[];

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  total: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  limit: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  totalPages: number;
}
