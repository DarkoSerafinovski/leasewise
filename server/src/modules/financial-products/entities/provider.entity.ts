import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { FinancialProduct } from './financial-product.entity';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string; // npr. "OTP Banka"

  @Column({ type: 'varchar', nullable: true })
  logo_url?: string;

  @Column({ type: 'varchar', nullable: true })
  website?: string;

  @OneToMany(() => FinancialProduct, (product) => product.provider)
  products!: FinancialProduct[];
}
