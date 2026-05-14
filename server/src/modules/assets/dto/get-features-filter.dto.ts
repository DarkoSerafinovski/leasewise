import { IsEnum, IsOptional } from 'class-validator';
import { FeatureCategory } from '../entities/features.entity';

export class GetFeaturesFilterDto {
  @IsOptional()
  @IsEnum(FeatureCategory, {
    message: 'Kategorija mora biti vehicle_equipment ili property_feature',
  })
  category?: FeatureCategory;
}
