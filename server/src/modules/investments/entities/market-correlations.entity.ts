import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MarketInstrument } from './market-instrument.entity';

@Entity('market_correlations')
export class MarketCorrelation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  instrument_a_id!: string;

  @Column('uuid')
  instrument_b_id!: string;

  @ManyToOne(() => MarketInstrument, (mi) => mi.correlationA, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'instrument_a_id' })
  instrument_a!: MarketInstrument;

  @ManyToOne(() => MarketInstrument, (mi) => mi.correlationB, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'instrument_b_id' })
  instrument_b!: MarketInstrument;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    comment: 'Vrednost od -1.00 do 1.00',
  })
  correlation_coefficient!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  last_calculated!: Date;
}
