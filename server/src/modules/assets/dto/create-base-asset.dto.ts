import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { AssetType } from '../entities/asset.entity';

export class BaseAssetDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @Min(0)
  base_price!: number;

  @IsString()
  @IsOptional()
  currency?: string = 'EUR';

  @IsEnum(AssetType)
  @IsNotEmpty()
  type!: AssetType;

  @IsInt()
  @IsOptional()
  market_category_id?: number;
}
