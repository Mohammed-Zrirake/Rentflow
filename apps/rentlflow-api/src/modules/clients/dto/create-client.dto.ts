/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { Gender } from '@rentflow/database';
import { Transform } from 'class-transformer';



export class CreateClientDto {
  @IsString() @IsNotEmpty() firstName: string;
  @IsString() @IsNotEmpty() lastName: string;
  @IsString() @IsNotEmpty() phone: string;
  @IsString() @IsNotEmpty() driverLicense: string;
  @IsString() @IsNotEmpty() cin: string;
  @Transform(({ value }) => (value === '' ? null : value))
  @IsOptional()
  @ValidateIf((o) => o.email !== null) 
  @IsEmail({}, { message: "L'adresse email fournie est invalide." })
  email?: string | null;

  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() nationality?: string;
  @IsOptional() @IsEnum(Gender) gender?: Gender;
}
