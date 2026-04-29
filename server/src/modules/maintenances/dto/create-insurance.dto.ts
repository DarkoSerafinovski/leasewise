import { IsEnum, IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';
import { InsuranceType } from '../entities/insurance.entity';

export class CreateInsuranceDto {
  @IsUUID()
  @IsNotEmpty()
  asset_id!: string;

  @IsEnum(InsuranceType)
  @IsNotEmpty()
  insurance_type!: InsuranceType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  annual_premium!: number;
}
