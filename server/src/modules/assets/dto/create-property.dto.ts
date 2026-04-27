import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { BaseAssetDto } from './create-base-asset.dto';

export class CreatePropertyDto extends BaseAssetDto {
  @IsNumber()
  @Min(1)
  sq_meters!: number;

  @IsString()
  @IsNotEmpty()
  location_zone!: string;

  @IsNumber()
  @IsOptional()
  estimated_monthly_rent?: number;

  @IsNumber()
  @IsOptional()
  annual_property_tax?: number;
}
