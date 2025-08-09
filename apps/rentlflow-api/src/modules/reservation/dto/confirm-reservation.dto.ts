import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { PaymentMethod } from '@rentflow/database';

export class ConfirmReservationDto {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  downPaymentAmount?: number; 

  @IsEnum(PaymentMethod)
  @IsOptional()
  downPaymentMethod?: PaymentMethod; 
}
