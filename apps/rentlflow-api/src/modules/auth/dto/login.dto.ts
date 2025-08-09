/* eslint-disable @typescript-eslint/no-unsafe-call */
// file: apps/rentflow-api/src/auth/dto/login.dto.ts

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
