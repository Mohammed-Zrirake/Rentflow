/* eslint-disable @typescript-eslint/no-unsafe-call */
// file: apps/rentflow-api/src/auth/dto/register.dto.ts

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  @IsNotEmpty({ message: 'Email should not be empty.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Name should not be empty.' })
  name: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password: string;
}
