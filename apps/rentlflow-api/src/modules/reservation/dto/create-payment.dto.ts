import { IsEnum, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { PaymentMethod } from '@rentflow/database';

export class CreatePaymentDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  method: PaymentMethod;
}
