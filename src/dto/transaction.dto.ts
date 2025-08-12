import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, TransactionStatus } from '@optimatech88/titomeet-shared-lib';
import {
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsString,
} from 'class-validator';

export class SubscriptionPayloadDto {
    @ApiProperty({ description: 'Pricing ID' })
    @IsString()
    @IsNotEmpty()
    pricingId: string;

    @ApiProperty({ description: 'Payment method' })
    @IsEnum(PaymentMethod)
    @IsNotEmpty()
    paymentMethod: PaymentMethod;
}

export class TransactionDto {
    @ApiProperty({ description: 'Transaction ID' })
    @IsString()
    @IsNotEmpty()
    id: string;

    @ApiProperty({ description: 'Transaction amount' })
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @ApiProperty({ description: 'Transaction status' })
    @IsEnum(TransactionStatus)
    @IsNotEmpty()
    status: TransactionStatus;

    @ApiProperty({ description: 'Transaction created at' })
    @IsDate()
    @IsNotEmpty()
    createdAt: Date;

    @ApiProperty({ description: 'Transaction updated at' })
    @IsDate()
    @IsNotEmpty()
    updatedAt: Date;

    @ApiProperty({ description: 'Transaction user' })
    @IsString()
    @IsNotEmpty()
    userId: string;
}