import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { InstrumentYield } from './instrument-yield.entity';
import { MarketCorrelation } from './market-correlations.entity';
import { PortfolioComposition } from 'src/modules/portfolios/entities/portfolio-composition.entity';

export enum AssetClass {
  EQUITY = 'EQUITY',
  FIXED_INCOME = 'FIXED_INCOME',
  COMMODITY = 'COMMODITY',
  CASH = 'CASH',
  CRYPTO = 'CRYPTO',
}

@Entity('market_instruments')
export class MarketInstrument {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  ticker!: string;

  @Column()
  name!: string;

  @Column({ type: 'enum', enum: AssetClass })
  asset_class!: AssetClass;

  @Column({ type: 'decimal', precision: 5, scale: 3, default: 0 })
  expense_ratio_pct!: number;

  @OneToOne(() => InstrumentYield, (yields) => yields.instrument, {
    cascade: true,
  })
  yields!: InstrumentYield;

  @OneToMany(() => MarketCorrelation, (mc) => mc.instrument_a)
  correlationA!: MarketCorrelation;

  @OneToMany(() => MarketCorrelation, (mc) => mc.instrument_b)
  correlationB!: MarketCorrelation;

  @OneToMany(() => PortfolioComposition, (comp) => comp.instrument, {
    cascade: true,
  })
  compositions!: PortfolioComposition[];
}
