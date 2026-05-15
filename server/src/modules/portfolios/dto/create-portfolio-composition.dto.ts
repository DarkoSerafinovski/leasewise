import { IsNumber, IsUUID, Max, Min } from 'class-validator';

export class CreatePortfolioCompositionDto {
  @IsUUID()
  instrument_id!: string;

  @IsNumber()
  @Min(0.01)
  @Max(100)
  allocation_pct!: number;
}
