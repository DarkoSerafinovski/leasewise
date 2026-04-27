import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Asset } from './asset.entity';

export enum FuelType {
  PETROL = 'petrol',
  DIESEL = 'diesel',
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
}

@Entity('vehicles')
export class Vehicle {
  @PrimaryColumn('uuid')
  asset_id!: string;

  @OneToOne(() => Asset, (a) => a.vehicle)
  @JoinColumn({ name: 'asset_id' })
  asset!: Asset;

  @Column()
  make!: string;

  @Column()
  model!: string;

  @Column()
  production_year!: number;

  @Column({ type: 'enum', enum: FuelType })
  fuel_type!: FuelType;
}
