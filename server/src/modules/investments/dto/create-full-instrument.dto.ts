import {
  IsString,
  IsEnum,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { AssetClass } from '../entities/market-instrument.entity';

export class CreateFullInstrumentDto {
  // --- Polja za MarketInstrument ---

  @IsString()
  @IsNotEmpty()
  ticker!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(AssetClass)
  @IsNotEmpty()
  asset_class!: AssetClass;

  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  expense_ratio_pct!: number;

  // --- Polja za InstrumentYield ---

  @IsNumber()
  @IsNotEmpty()
  avg_yield_5y!: number;

  @IsNumber()
  @IsNotEmpty()
  avg_yield_10y!: number;

  @IsNumber()
  @IsNotEmpty()
  avg_yield_20y!: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  standard_deviation!: number;

  @IsNumber()
  @Max(0)
  @IsNotEmpty()
  worst_year_drawdown!: number;
}
