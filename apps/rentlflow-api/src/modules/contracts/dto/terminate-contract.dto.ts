import { PaymentMethod } from '@rentflow/database';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';


export enum VehicleReturnState {
  GOOD = 'GOOD',
  AVERAGE = 'AVERAGE',
  DAMAGED = 'DAMAGED',
}

export class TerminateContractDto {
  @IsDateString()
  @IsNotEmpty()
  returnDate: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  returnMileage: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  returnFuelLevel?: number;

  @IsString()
  @IsOptional()
  returnNotes?: string;

  @IsEnum(VehicleReturnState)
  @IsNotEmpty()
  vehicleState: VehicleReturnState;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  finalPaymentAmount?: number;

  @IsEnum(PaymentMethod)
  @IsOptional()
  finalPaymentMethod?: PaymentMethod;
}
