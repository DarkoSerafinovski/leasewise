import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsNumber,
  IsDate,
  IsUUID,
  Length,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBusinessProfileDto {
  @IsUUID('4', { message: 'ID korisnika mora biti validan UUID' })
  @IsNotEmpty()
  user_id!: string;

  @IsString()
  @IsNotEmpty({ message: 'Naziv kompanije je obavezan' })
  company_name!: string;

  @IsString()
  @Length(9, 9, { message: 'PIB mora imati tačno 9 cifara' })
  pib!: string;

  @IsString()
  @Length(8, 8, { message: 'Matični broj mora imati tačno 8 cifara' })
  registration_number!: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Godišnji prihod mora biti broj' },
  )
  @IsOptional()
  @Min(0)
  annual_revenue?: number;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'EBITDA mora biti broj' })
  @IsOptional()
  ebitda?: number;

  @IsBoolean({ message: 'is_tax_payer mora biti true ili false' })
  @IsOptional()
  is_tax_payer?: boolean;

  @Type(() => Date)
  @IsDate({ message: 'Datum osnivanja mora biti validan datum' })
  @IsNotEmpty()
  founded_date!: Date;
}
