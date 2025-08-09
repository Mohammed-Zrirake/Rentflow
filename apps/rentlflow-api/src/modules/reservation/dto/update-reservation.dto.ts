// rentflow-api/src/modules/reservations/dto/update-reservation.dto.ts

import { ReservationStatus } from '@rentflow/database';
import { CreatePaymentDto } from './create-payment.dto'; 
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateReservationDto {
  @IsString()
  @IsOptional()
  clientId?: string;

  @IsString()
  @IsOptional()
  vehicleId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  estimatedCost?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(ReservationStatus)
  @IsOptional()
  status?: ReservationStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentDto)
  @IsOptional()
  payments?: CreatePaymentDto[];
}
