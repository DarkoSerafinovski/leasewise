import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { MarketInstrument } from './market-instrument.entity';

@Entity('instrument_yields')
export class InstrumentYield {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  instrument_id!: string;

  @OneToOne(() => MarketInstrument, (inst) => inst.yields, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'instrument_id' })
  instrument!: MarketInstrument;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  avg_yield_5y!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  avg_yield_10y!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  avg_yield_20y!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  standard_deviation!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  worst_year_drawdown!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  last_updated!: Date;
}
