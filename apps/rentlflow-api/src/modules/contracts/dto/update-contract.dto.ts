import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateContractDto {
  @IsString() @IsOptional() secondaryDriverId?: string;
  // @IsDateString() @IsOptional() startDate?: string;
  // @IsDateString() @IsOptional() endDate?: string;
  // @IsNumber() @Min(0) @IsOptional() dailyRate?: number;
  @IsNumber() @Min(0) @IsOptional() totalCost?: number;
  @IsNumber() @Min(0) @IsOptional() pickupMileage?: number;
  @IsNumber() @Min(0) @IsOptional() pickupFuelLevel?: number;
  @IsString() @IsOptional() pickupNotes?: string;
}
