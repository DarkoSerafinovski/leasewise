import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { FinancialProduct } from './financial-product.entity';

@Entity('tax_shield_rules')
export class TaxShieldRule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  product_id!: string;

  @OneToOne(() => FinancialProduct, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: FinancialProduct;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: 'Procenat PDV-a koji firma može da odbije (npr. 100.00 ili 0.00)',
  })
  vat_deductible_pct!: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 100.0,
    comment: 'Procenat rate koji ulazi u trošak za porez na dobit',
  })
  expense_recognition_pct!: number;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Da li proizvod dozvoljava ubrzanu amortizaciju',
  })
  depreciation_acceleration_allowed!: boolean;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Da li je zakup vanbilansna stavka (ne ulazi u dug firme)',
  })
  is_off_balance_sheet!: boolean;
}
