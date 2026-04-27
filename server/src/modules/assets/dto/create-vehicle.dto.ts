import { IsEnum, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { BaseAssetDto } from './create-base-asset.dto';
import { FuelType } from '../entities/vehicles.entity';

export class CreateVehicleDto extends BaseAssetDto {
  @IsString()
  @IsNotEmpty()
  make!: string;

  @IsString()
  @IsNotEmpty()
  model!: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  production_year!: number;

  @IsEnum(FuelType)
  fuel_type!: FuelType;
}
