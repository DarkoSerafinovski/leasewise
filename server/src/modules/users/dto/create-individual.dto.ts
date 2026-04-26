import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsDate,
  IsUUID,
  Length,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateIndividualProfileDto {
  @IsUUID('4', { message: 'ID korisnika mora biti validan UUID' })
  @IsNotEmpty()
  user_id!: string;

  @IsString()
  @IsNotEmpty({ message: 'Ime je obavezno' })
  first_name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Prezime je obavezno' })
  last_name!: string;

  @IsString()
  @Length(13, 13, { message: 'JMBG mora imati tačno 13 cifara' })
  jmbg!: string;

  @IsEnum(['employed', 'self_employed', 'unemployed'], {
    message:
      'Status zaposlenja mora biti: employed, self_employed ili unemployed',
  })
  employment_status!: string;

  @Type(() => Date)
  @IsDate({ message: 'Datum početka zaposlenja mora biti validan datum' })
  @IsNotEmpty()
  employment_start_date!: Date;

  @IsBoolean({
    message: 'Polje is_permanently_employed mora biti true ili false',
  })
  is_permanently_employed!: boolean;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Mesečna primanja moraju biti broj' },
  )
  @Min(0)
  monthly_net_income!: number;
}
