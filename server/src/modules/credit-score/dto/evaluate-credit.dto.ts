import { IsUUID, IsNumber, Min, IsInt } from 'class-validator';

export class EvaluateCreditDto {
  @IsUUID()
  productId!: string;

  @IsNumber()
  @Min(1)
  requestedAmount!: number;

  @IsNumber()
  @Min(0)
  downPaymentAmount!: number;

  @IsInt()
  @Min(6)
  tenureMonths!: number;
}
