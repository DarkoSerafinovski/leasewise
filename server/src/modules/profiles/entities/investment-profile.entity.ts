import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ExperienceLevel } from './experience-levels.entity';
import { RiskTolerance } from './risk-tolerances.entity';

@Entity('investment_profiles')
export class InvestmentProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  user_id!: string;

  @OneToOne(() => User, (user) => user.investmentProfile)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  risk_tolerance_id?: number;

  @ManyToOne(() => RiskTolerance, (rt) => rt.profile)
  @JoinColumn({ name: 'risk_tolerance_id' })
  risk_tolerance!: RiskTolerance;

  @Column()
  experience_level_id!: number;

  @ManyToOne(() => ExperienceLevel, (el) => el.profile)
  @JoinColumn({ name: 'experience_level_id' })
  experience_level!: ExperienceLevel;

  @Column('json', { nullable: true })
  preferred_asset_classes!: string[];

  @CreateDateColumn()
  last_test_date!: Date;
}
