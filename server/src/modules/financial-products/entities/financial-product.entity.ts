// src/modules/financial-products/entities/financial-product.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductCondition } from './product-condition.entity';
import { TaxShieldRule } from './tax-shield-rule.entity';
import { ProductEligibility } from './product-eligibility.entity';
import { Provider } from './provider.entity';
import { CreditSnapshot } from 'src/modules/credit-score/entities/credit-snapshot.entity';

export enum ProductType {
  CASH_LOAN = 'CASH_LOAN',
  FINANCIAL_LEASE = 'FINANCIAL_LEASE',
  OPERATING_LEASE = 'OPERATING_LEASE',
  MORTGAGE = 'MORTGAGE',
}

@Entity('financial_products')
export class FinancialProduct {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  provider_id!: string;

  @ManyToOne(() => Provider, (provider) => provider.products)
  @JoinColumn({ name: 'provider_id' })
  provider!: Provider;

  @Column({
    type: 'enum',
    enum: ProductType,
    default: ProductType.FINANCIAL_LEASE,
  })
  product_type!: ProductType;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    comment:
      'Maksimalno opterećenje plate koje banka dozvoljava (npr. 0.40 za 40%)',
  })
  max_dti_allowed!: number;

  @Column({ type: 'varchar', length: 10, default: 'EUR' })
  currency!: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToOne(() => ProductCondition, (conditions) => conditions.product)
  conditions!: ProductCondition;

  @OneToOne(() => TaxShieldRule, (rules) => rules.product)
  tax_rules!: TaxShieldRule;

  @OneToMany(() => ProductEligibility, (eligibility) => eligibility.product)
  eligibility_rules!: ProductEligibility[];

  @OneToMany(() => CreditSnapshot, (cs) => cs.product)
  creditScores!: CreditSnapshot[];
}
