import { IsNumber, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CalculateAnalysisDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: 'Cena aseta mora biti pozitivan broj' })
  assetPrice!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Učešće ne može biti negativno' })
  downPayment!: number;
}
