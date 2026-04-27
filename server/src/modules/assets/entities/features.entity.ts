import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AssetFeature } from './asset-feature-entity';

export enum FeatureCategory {
  VEHICLE_EQUIPMENT = 'vehicle_equipment',
  PROPERTY_FEATURE = 'property_feature',
}

@Entity('features')
export class Feature {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'enum', enum: FeatureCategory })
  category!: FeatureCategory;

  @OneToMany(() => AssetFeature, (af) => af.feature)
  assetFeatures!: AssetFeature[];
}
