import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { InvestmentProfile } from './investment-profile.entity';

@Entity('risk_tolerances')
export class RiskTolerance {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ type: 'float' })
  max_risk_score!: number;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @OneToMany(() => InvestmentProfile, (ip) => ip.risk_tolerance)
  profile!: InvestmentProfile;
}
