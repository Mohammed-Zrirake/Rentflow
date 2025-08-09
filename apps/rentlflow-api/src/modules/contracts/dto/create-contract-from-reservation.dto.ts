import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateContractFromReservationDto {
  @IsString()
  @IsNotEmpty()
  reservationId: string;

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

  @IsString()
  @IsOptional()
  secondaryDriverId?: string;
}
