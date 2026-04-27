import { IsArray, IsString, IsNumber } from 'class-validator';

export class UpsertInvestmentProfileDto {
  @IsNumber()
  risk_tolerance_id!: number;

  @IsNumber()
  experience_level_id!: number;

  @IsArray()
  @IsString({ each: true })
  preferred_asset_classes!: string[];
}
