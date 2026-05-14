// src/modules/financial-products/entities/product-eligibility.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FinancialProduct } from './financial-product.entity';
import { AssetType } from 'src/modules/assets/entities/asset.entity';

@Entity('product_eligibility')
export class ProductEligibility {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => FinancialProduct, (product) => product.eligibility_rules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product!: FinancialProduct;

  @Column({
    type: 'enum',
    enum: AssetType,
    comment: 'Tip aseta na koji se pravilo odnosi',
  })
  asset_type!: AssetType;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  min_asset_value?: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  max_asset_value?: number;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'Maksimalna dozvoljena starost aseta u godinama',
  })
  max_asset_age?: number;

  @Column({ type: 'boolean', default: true })
  is_allowed!: boolean;
}
