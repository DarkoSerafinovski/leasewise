import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Morate uneti ispravnu email adresu' })
  @IsNotEmpty({ message: 'Email ne sme biti prazan' })
  email!: string;

  @IsNotEmpty({ message: 'Lozinka ne sme biti prazna' })
  @MinLength(6, { message: 'Lozinka mora imati najmanje 6 karaktera' })
  password!: string;
}
