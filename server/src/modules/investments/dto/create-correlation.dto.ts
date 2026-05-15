import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateCorrelationDto {
  @IsString()
  @IsNotEmpty()
  instrument_a_id!: string;

  @IsString()
  @IsNotEmpty()
  instrument_b_id!: string;

  @IsNumber()
  @Min(-1)
  @Max(1)
  @IsNotEmpty()
  correlation_coefficient!: number;
}
