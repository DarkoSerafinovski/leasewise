import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Asset } from './asset.entity';
import { Feature } from './features.entity';

@Entity('asset_features')
export class AssetFeature {
  @PrimaryColumn()
  asset_id!: string;

  @PrimaryColumn()
  feature_id!: number;

  @ManyToOne(() => Asset, (a) => a.assetFeatures)
  @JoinColumn({ name: 'asset_id' })
  asset!: Asset;

  @ManyToOne(() => Feature)
  @JoinColumn({ name: 'feature_id' })
  feature!: Feature;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_impact!: number;
}
