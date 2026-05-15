import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { InvestmentPortfolio } from './investment-portfolio.entity';

@Entity('self_funding_programs')
export class SelfFundingProgram {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  portfolio_id!: string;

  @OneToOne(() => InvestmentPortfolio, (p) => p.self_funding_program, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'portfolio_id' })
  portfolio!: InvestmentPortfolio;

  @Column({ type: 'int', default: 12 })
  safety_buffer_months!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  cash_reserve_amount!: number;

  @Column({ type: 'timestamp', nullable: true })
  last_liquidation_date!: Date;

  @Column({ type: 'timestamp', nullable: true })
  next_rebalance_date!: Date;
}
