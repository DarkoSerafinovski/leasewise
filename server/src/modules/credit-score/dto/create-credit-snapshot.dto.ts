import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCreditSnapshotDto {
  @IsUUID()
  @IsNotEmpty()
  user_id!: string;

  @IsUUID()
  @IsNotEmpty()
  product_id!: string;

  @IsNumber()
  @IsNotEmpty()
  score_category_id!: number;

  @IsNumber()
  net_income_at_time!: number;

  @IsNumber()
  total_debt_at_time!: number;

  @IsNumber()
  dti_ratio_at_time!: number;

  @IsNumber()
  max_approved_monthly_installment!: number;

  @IsBoolean()
  is_eligible!: boolean;

  @IsString()
  @IsOptional()
  rejection_reason?: string;
}

export class UpdateCreditSnapshotDto extends PartialType(
  CreateCreditSnapshotDto,
) {}
