import { Asset } from 'src/modules/assets/entities/asset.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum InsuranceType {
  KASKO = 'Kasko',
  OBAVEZNO = 'Obavezno',
  OBJEKAT = 'Osiguranje_Objekta',
}

@Entity('insurances')
export class Insurance {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  asset_id!: string;

  @ManyToOne(() => Asset, (asset) => asset.insurances)
  @JoinColumn({ name: 'asset_id' })
  asset!: Asset;

  @Column({ type: 'enum', enum: InsuranceType })
  insurance_type!: InsuranceType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  annual_premium!: number;
}
