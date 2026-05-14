import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { FinancialProduct } from './financial-product.entity';
import { IndexRate } from './index-rate.entity';

@Entity('product_conditions')
export class ProductCondition {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  product_id!: string;

  @OneToOne(() => FinancialProduct, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: FinancialProduct;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  nominal_interest_rate!: number;

  @Column({ type: 'boolean', default: false })
  is_variable!: boolean;

  @Column('uuid')
  index_rate_id!: string;

  @ManyToOne(() => IndexRate, (indexRate) => indexRate.conditions, {
    nullable: true,
  })
  @JoinColumn({ name: 'index_rate_id' })
  index_rate_ref!: IndexRate;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  margin?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  min_down_payment_pct!: number;

  @Column({ type: 'int' })
  max_tenure_months!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  effective_interest_rate!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  processing_fee_pct!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  residual_value_pct!: number;
}
