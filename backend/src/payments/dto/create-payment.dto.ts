import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentType, PaymentMethod } from '../schemas/payment.schema';

export class CreatePaymentDto {
  @ApiProperty() @IsString() applicationId: string;

  @ApiProperty({ example: 500 })
  @IsNumber() @Min(1)
  amount: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  currency: string;

  @ApiProperty({ enum: PaymentType })
  @IsEnum(PaymentType)
  type: PaymentType;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;
}
