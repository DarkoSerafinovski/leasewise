import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateRiskToleranceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsNotEmpty()
  max_risk_score!: number;

  @IsString()
  @IsOptional()
  description?: string;
}
