import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProductCondition } from './product-condition.entity';

@Entity('index_rates')
export class IndexRate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name!: string;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 3,
    comment: 'Trenutna vrednost stope (npr. 3.895)',
  })
  current_value!: number;

  @UpdateDateColumn()
  last_updated!: Date;

  @OneToMany(() => ProductCondition, (condition) => condition.index_rate_ref)
  conditions!: ProductCondition[];
}
