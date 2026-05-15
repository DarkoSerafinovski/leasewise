import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateSelfFundingProgramDto } from './create-self-funding-program.dto';
import { CreatePortfolioCompositionDto } from './create-portfolio-composition.dto';

export class CreateInvestmentPortfolioDto {
  @IsString()
  name!: string;

  @IsInt()
  @Min(1)
  @Max(10)
  risk_level!: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ValidateNested()
  @Type(() => CreateSelfFundingProgramDto)
  funding_program!: CreateSelfFundingProgramDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePortfolioCompositionDto)
  compositions!: CreatePortfolioCompositionDto[];
}
