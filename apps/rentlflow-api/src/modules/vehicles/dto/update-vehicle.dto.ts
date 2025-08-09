import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  Max,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VehicleStatus } from '@rentflow/database';


export class UpdateVehicleDto {
  @IsOptional() @IsString() @IsNotEmpty() make?: string;
  @IsOptional() @IsString() @IsNotEmpty() model?: string;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1980)
  @Max(new Date().getFullYear() + 1)
  year?: number;
  @IsOptional() @IsString() @IsNotEmpty() licensePlate?: string;
  @IsOptional() @IsString() vin?: string;
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  dailyRate?: number;
  @IsOptional() @IsEnum(VehicleStatus) status?: VehicleStatus;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) mileage?: number;
  @IsOptional() @Type(() => Date) insuranceExpiryDate?: Date | null;
  @IsOptional() @Type(() => Date) technicalInspectionExpiryDate?: Date | null;
  @IsOptional() @Type(() => Date) trafficLicenseExpiryDate?: Date | null;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  nextOilChangeMileage?: number | null;


  @IsOptional() @IsString({ each: true }) imagesToDelete?: string[];
}
