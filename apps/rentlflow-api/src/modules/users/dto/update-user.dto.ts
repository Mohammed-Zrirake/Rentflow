import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserStatus } from '@rentflow/database';

export class UpdateUserDto {
  @IsString({ message: 'Le nom doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'Le nom est requis.' })
  name: string;

  @IsEmail({}, { message: 'Veuillez entrer une adresse email valide.' })
  @IsNotEmpty({ message: "L'email est requis." })
  email: string;

  @IsOptional() 
  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit faire au moins 8 caractères.',
  })
  password?: string;

  @IsEnum(UserStatus, {
    message: 'Le statut doit être une valeur valide (ACTIVE ou INACTIVE).',
  })
  @IsNotEmpty({ message: 'Le statut est requis.' })
  status: UserStatus;
}
