import {
  IsOptional,
  IsEnum,
  IsNumber,
  IsString,
  IsInt,
  IsArray,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { AssetType } from './asset.entity';
import { FuelType } from './vehicles.entity';

export class GetAssetsFilterDto {
  // Osnovni filteri
  @IsOptional() @IsEnum(AssetType) type?: AssetType;
  @IsOptional() @IsNumber() minPrice?: number;
  @IsOptional() @IsNumber() maxPrice?: number;
  @IsOptional() @IsString() currency?: string;

  // Vozila
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

  // Nekretnine
  @IsOptional() @IsNumber() minSqMeters?: number;
  @IsOptional() @IsNumber() maxSqMeters?: number;
  @IsOptional() @IsString() locationZone?: string;
  @IsOptional() @IsNumber() minRent?: number;
  @IsOptional() @IsNumber() maxRent?: number;
  @IsOptional() @IsNumber() minTax?: number;
  @IsOptional() @IsNumber() maxTax?: number;

  // Paginacija i Sortiranje
  @IsOptional() @IsInt() page?: number = 1;
  @IsOptional() @IsInt() per_page?: number = 10;
  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsIn(['ASC', 'DESC']) sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
