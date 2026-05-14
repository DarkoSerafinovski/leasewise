import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CreditSnapshot } from './credit-snapshot.entity';

@Entity('credit_score_categories')
export class CreditScoreCategory {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ unique: true })
  grade!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  min_score_threshold!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  max_score_threshold!: number;

  @Column()
  description!: string;

  @Column({ default: true })
  is_active!: boolean;

  @OneToMany(() => CreditSnapshot, (cs) => cs.score_category)
  creditScores!: CreditSnapshot[];
}
