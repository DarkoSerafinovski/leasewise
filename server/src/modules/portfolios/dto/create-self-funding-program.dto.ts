import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class CreateSelfFundingProgramDto {
  @IsInt()
  @Min(1)
  @Max(36)
  safety_buffer_months!: number;

  @IsNumber()
  @IsOptional()
  initial_cash_reserve?: number = 0;
}
