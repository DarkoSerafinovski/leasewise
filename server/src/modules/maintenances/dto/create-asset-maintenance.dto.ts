import { IsInt, IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateAssetMaintenanceDto {
  @IsUUID()
  @IsNotEmpty()
  asset_id!: string;

  @IsInt()
  @IsNotEmpty()
  maintenance_type_id!: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  frequency_months!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  estimated_cost!: number;
}
