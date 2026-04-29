import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AssetMaintenance } from './asset-maintenance.entity';

@Entity('maintenance_types')
export class MaintenanceType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @OneToMany(() => AssetMaintenance, (am) => am.maintenanceType)
  maintenances!: AssetMaintenance[];
}
