import {
  IsNumber,
  IsString,
  ValidateNested,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  OrderStatus,
  PaymentStatus,
} from '@optimatech88/titomeet-shared-lib';

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
  @IsNotEmpty()
  paymentIntentId: string;
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

