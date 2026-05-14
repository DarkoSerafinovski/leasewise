import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateCreditScoreCategoryDto {
  @IsString()
  @IsNotEmpty()
  grade!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  min_score_threshold!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  max_score_threshold!: number;

  @IsString()
  description!: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;
}

export class UpdateCreditScoreCategoryDto extends PartialType(
  CreateCreditScoreCategoryDto,
) {}
