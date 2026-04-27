import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateMarketDepreciationDto {
  @IsString()
  @IsNotEmpty()
  category_name!: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  year_1_pct!: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  annual_avg_pct!: number;

  @IsBoolean()
  is_appreciation!: boolean;
}
