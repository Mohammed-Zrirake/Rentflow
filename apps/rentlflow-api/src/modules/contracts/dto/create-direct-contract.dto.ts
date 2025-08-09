import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreatePaymentDto } from '../../reservation/dto/create-payment.dto'; 

export class CreateContractDto {
  // Optionnel: ID de la réservation si le contrat en découle
  @IsString()
  @IsOptional()
  reservationId?: string;

  // Requis si ce n'est pas une réservation
  @IsString()
  @IsOptional()
  clientId?: string;

  @IsString()
  @IsOptional()
  vehicleId?: string;

  // Optionnel: Conducteur secondaire
  @IsString()
  @IsOptional()
  secondaryDriverId?: string;

  // Requis pour les contrats directs
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  dailyRate?: number;

  @IsNumber()
  @IsOptional()
  totalCost?: number;

  // Toujours requis
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  pickupMileage: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  pickupFuelLevel?: number;

  @IsString()
  @IsOptional()
  pickupNotes?: string;


  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentDto)
  @IsOptional()
  payments?: CreatePaymentDto[];
}
