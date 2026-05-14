import { FinancialProduct } from 'src/modules/financial-products/entities/financial-product.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CreditScoreCategory } from './credit-score-category.entity';

@Entity('credit_snapshots')
export class CreditSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  user_id!: string;

  @ManyToOne(() => User, (u) => u.creditScores)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column('uuid')
  product_id!: string;

  @ManyToOne(() => FinancialProduct, (fp) => fp.creditScores)
  @JoinColumn({ name: 'product_id' })
  product!: FinancialProduct;

  @Column()
  score_category_id!: number;

  @ManyToOne(() => CreditScoreCategory, (csc) => csc.creditScores)
  @JoinColumn({ name: 'score_category_id' })
  score_category!: CreditScoreCategory;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  net_income_at_time!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_debt_at_time!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  dti_ratio_at_time!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  max_approved_monthly_installment!: number;

  @Column({ type: 'boolean' })
  is_eligible!: boolean;

  @Column({ type: 'boolean', default: 'false' })
  is_active_engagement!: boolean;

  @Column({ type: 'text', nullable: true })
  rejection_reason!: string;

  @CreateDateColumn()
  created_at!: Date;
}
