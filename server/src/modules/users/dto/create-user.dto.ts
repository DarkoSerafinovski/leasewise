import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { UserRole, AuthMethod } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail({}, { message: 'Morate uneti validnu email adresu' })
  @IsNotEmpty({ message: 'Email je obavezan' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Lozinka je obavezna' })
  @MinLength(8, { message: 'Lozinka mora imati najmanje 8 karaktera' })
  password!: string;

  @IsEnum(UserRole, {
    message: 'Uloga mora biti: admin, individual ili business',
  })
  @IsNotEmpty({ message: 'Uloga korisnika je obavezna' })
  role!: UserRole;

  @IsEnum(AuthMethod, { message: 'Metoda autentifikacije mora biti validna' })
  @IsOptional()
  auth_method?: AuthMethod;

  @IsBoolean({ message: 'isActive mora biti boolean vrednost' })
  @IsOptional()
  isActive?: boolean;
}
