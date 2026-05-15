import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InvestmentPortfolio } from './investment-portfolio.entity';
import { MarketInstrument } from '../../investments/entities/market-instrument.entity';

@Entity('portfolio_compositions')
export class PortfolioComposition {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  portfolio_id!: string;

  @Column('uuid')
  instrument_id!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  allocation_pct!: number;

  @ManyToOne(() => InvestmentPortfolio, (p) => p.compositions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'portfolio_id' })
  portfolio!: InvestmentPortfolio;

  @ManyToOne(() => MarketInstrument, (mi) => mi.compositions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'instrument_id' })
  instrument!: MarketInstrument;
}
