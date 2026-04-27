import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { FeatureCategory } from '../entities/features.entity';

export class CreateFeatureDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(FeatureCategory)
  category!: FeatureCategory;
}
