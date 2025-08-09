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

export class CreateVehicleDto {
  @IsString() @IsNotEmpty() make: string;
  @IsString() @IsNotEmpty() model: string;
  @Type(() => Number)
  @IsInt()
  @Min(1980)
  @Max(new Date().getFullYear() + 1)
  year: number;
  @IsString() @IsNotEmpty() licensePlate: string;
  @IsString() @IsOptional() vin?: string;
  @Type(() => Number) @IsNumber() @IsPositive() dailyRate: number;
  @IsEnum(VehicleStatus) status: VehicleStatus;
  @Type(() => Number) @IsInt() @Min(0) mileage: number;
  @IsOptional() @Type(() => Date) insuranceExpiryDate?: Date;
  @IsOptional() @Type(() => Date) technicalInspectionExpiryDate?: Date;
  @IsOptional() @Type(() => Date) trafficLicenseExpiryDate?: Date;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  nextOilChangeMileage?: number;
}
