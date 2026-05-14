import {
  IsOptional,
  IsEnum,
  IsNumber,
  IsString,
  IsInt,
  IsArray,
  IsIn,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { AssetType } from './asset.entity';
import { FuelType } from './vehicles.entity';

export class GetAssetsFilterDto {
  @IsOptional() @IsEnum(AssetType) type?: AssetType;
  @IsOptional() @IsNumber() minPrice?: number;
  @IsOptional() @IsNumber() maxPrice?: number;
  @IsOptional() @IsString() currency?: string;

  @IsOptional() @IsString() make?: string;
  @IsOptional() @IsString() model?: string;
  @IsOptional() @IsInt() minYear?: number;
  @IsOptional() @IsInt() maxYear?: number;

  @IsOptional()
  @IsArray()
  @IsEnum(FuelType, { each: true })
  @Transform(({ value }: { value: unknown }) => {
    if (Array.isArray(value)) return value as FuelType[];
    if (typeof value === 'string') return [value] as FuelType[];
    return [];
  })
  fuelTypes?: FuelType[];

  @IsOptional() @IsNumber() minSqMeters?: number;
  @IsOptional() @IsNumber() maxSqMeters?: number;
  @IsOptional() @IsString() locationZone?: string;
  @IsOptional() @IsNumber() minRent?: number;
  @IsOptional() @IsNumber() maxRent?: number;
  @IsOptional() @IsNumber() minTax?: number;
  @IsOptional() @IsNumber() maxTax?: number;

  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsNumber() per_page?: number = 10;
  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsIn(['ASC', 'DESC']) sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
