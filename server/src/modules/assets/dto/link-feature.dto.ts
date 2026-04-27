// dto/link-feature.dto.ts
import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class LinkFeatureDto {
  @IsUUID()
  @IsNotEmpty()
  asset_id!: string;

  @IsNumber()
  @IsNotEmpty()
  feature_id!: number;

  @IsNumber()
  @Min(0)
  price_impact!: number;
}
