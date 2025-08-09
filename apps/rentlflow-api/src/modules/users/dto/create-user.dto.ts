import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { UserStatus } from '@rentflow/database';

export class CreateUserDto {
  @IsString({ message: 'Le nom doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'Le nom est requis.' })
  name: string;

  @IsEmail({}, { message: 'Veuillez entrer une adresse email valide.' })
  @IsNotEmpty({ message: "L'email est requis." })
  email: string;

  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit faire au moins 8 caractères.',
  })
  @IsNotEmpty({ message: 'Le mot de passe est requis.' })
  password: string;

  @IsEnum(UserStatus, {
    message: 'Le statut doit être une valeur valide (ACTIVE ou INACTIVE).',
  })
  @IsNotEmpty({ message: 'Le statut est requis.' })
  status: UserStatus;
}
