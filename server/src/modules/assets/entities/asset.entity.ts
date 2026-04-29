import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Vehicle } from './vehicles.entity';
import { Property } from './property.entity';
import { AssetFeature } from './asset-feature-entity';
import { MarketDepreciation } from 'src/modules/market/entities/market-depreciation.entity';
import { AssetMaintenance } from 'src/modules/maintenances/entities/asset-maintenance.entity';
import { Insurance } from 'src/modules/maintenances/entities/insurance.entity';

export enum AssetType {
  VEHICLE = 'vehicle',
  PROPERTY = 'property',
}

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  base_price!: number;

  @Column({ default: 'EUR' })
  currency!: string;

  @Column({ type: 'enum', enum: AssetType })
  asset_type!: AssetType;

  @OneToOne(() => Vehicle, (v) => v.asset, { cascade: true })
  vehicle?: Vehicle;

  @OneToOne(() => Property, (p) => p.asset, { cascade: true })
  property?: Property;

  @OneToMany(() => AssetFeature, (af) => af.asset)
  assetFeatures!: AssetFeature[];

  @Column({ nullable: true })
  market_category_id?: number;

  @ManyToOne(() => MarketDepreciation, (md) => md.assets)
  @JoinColumn({ name: 'market_category_id' })
  marketCategory!: MarketDepreciation;

  @OneToMany(() => AssetMaintenance, (am) => am.asset)
  maintenances!: AssetMaintenance[];

  @OneToMany(() => Insurance, (i) => i.asset)
  insurances!: Insurance[];
}
