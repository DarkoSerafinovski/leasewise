import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Asset } from './asset.entity';

@Entity('properties')
export class Property {
  @PrimaryColumn('uuid')
  asset_id!: string;

  @OneToOne(() => Asset, (a) => a.property)
  @JoinColumn({ name: 'asset_id' })
  asset!: Asset;

  @Column({ type: 'decimal' })
  sq_meters!: number;

  @Column()
  location_zone!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  estimated_monthly_rent?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  annual_property_tax?: number;
}
