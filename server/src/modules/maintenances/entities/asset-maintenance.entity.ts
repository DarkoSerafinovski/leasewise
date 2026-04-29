import { Asset } from 'src/modules/assets/entities/asset.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MaintenanceType } from './maintenance-type.entity';

@Entity('asset_maintenance')
export class AssetMaintenance {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  asset_id!: string;

  @ManyToOne(() => Asset, (asset) => asset.maintenances)
  @JoinColumn({ name: 'asset_id' })
  asset!: Asset;

  @Column()
  maintenance_type_id!: number;

  @ManyToOne(() => MaintenanceType, (mt) => mt.maintenances)
  @JoinColumn({ name: 'maintenance_type_id' })
  maintenanceType!: MaintenanceType;

  @Column({ type: 'integer' })
  frequency_months!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  estimated_cost!: number;
}
