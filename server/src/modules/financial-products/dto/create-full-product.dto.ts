import {
  IsString,
  IsUUID,
  IsNumber,
  IsBoolean,
  IsEnum,
  ValidateNested,
  IsOptional,
  Min,
  Max,
  IsInt,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AssetType } from 'src/modules/assets/entities/asset.entity';
import { ProductType } from '../entities/financial-product.entity';
import { OmitType, PartialType } from '@nestjs/mapped-types';

export class ProductConditionsDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @Type(() => Number)
  nominal_interest_rate!: number;

  @IsBoolean()
  is_variable!: boolean;

  @IsUUID()
  @IsOptional()
  index_rate_id?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(20)
  @Type(() => Number)
  margin?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @Type(() => Number)
  min_down_payment_pct!: number;

  @IsInt()
  @Min(1)
  @Max(120)
  @Type(() => Number)
  max_tenure_months!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @Type(() => Number)
  effective_interest_rate!: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10)
  @Type(() => Number)
  processing_fee_pct?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @Type(() => Number)
  residual_value_pct?: number;
}

export class ProductEligibilityDto {
  @IsEnum(AssetType, {
    message:
      'Asset type mora biti jedna od validnih vrednosti (npr. VEHICLE, EQUIPMENT...)',
  })
  asset_type!: AssetType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  min_asset_value?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  max_asset_value?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(30)
  @Type(() => Number)
  max_asset_age?: number;

  @IsBoolean()
  @IsOptional()
  is_allowed: boolean = true;
}

export class TaxShieldRulesDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @Type(() => Number)
  vat_deductible_pct!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @Type(() => Number)
  expense_recognition_pct!: number;

  @IsBoolean()
  @IsOptional()
  depreciation_acceleration_allowed?: boolean = false;

  @IsBoolean()
  @IsOptional()
  is_off_balance_sheet?: boolean = false;
}

export class CreateFullProductDto {
  @IsUUID()
  providerId!: string;

  @IsEnum(ProductType)
  product_type!: ProductType;

  @IsNumber()
  @Min(0)
  @Max(1)
  max_dti_allowed!: number;

  @IsString()
  @Length(3, 3)
  currency!: string;

  @ValidateNested()
  @Type(() => ProductConditionsDto)
  conditions!: ProductConditionsDto;

  @ValidateNested()
  @Type(() => ProductEligibilityDto)
  eligibility!: ProductEligibilityDto;

  @ValidateNested()
  @Type(() => TaxShieldRulesDto)
  taxRules!: TaxShieldRulesDto;
}

export class UpdateConditionsDto extends PartialType(ProductConditionsDto) {}
export class UpdateEligibilityDto extends PartialType(ProductEligibilityDto) {}
export class UpdateTaxRulesDto extends PartialType(TaxShieldRulesDto) {}

export class UpdateFullProductDto extends PartialType(
  OmitType(CreateFullProductDto, [
    'conditions',
    'eligibility',
    'taxRules',
  ] as const),
) {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateConditionsDto)
  conditions?: UpdateConditionsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateEligibilityDto)
  eligibility?: UpdateEligibilityDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateTaxRulesDto)
  taxRules?: UpdateTaxRulesDto;
}
