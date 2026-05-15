import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PortfolioComposition } from './portfolio-composition.entity';
import { SelfFundingProgram } from './self-funding-program.entity';

@Entity('investment_portfolios')
export class InvestmentPortfolio {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'int', default: 5 })
  risk_level!: number;

  @Column({ default: false })
  is_active!: boolean;

  @Column({ default: 'EUR' })
  currency!: string;

  @Column('uuid')
  user_id!: string;

  @ManyToOne(() => User, (user) => user.portfolios)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => PortfolioComposition, (comp) => comp.portfolio, {
    cascade: true,
  })
  compositions!: PortfolioComposition[];

  @OneToOne(() => SelfFundingProgram, (program) => program.portfolio)
  self_funding_program!: SelfFundingProgram;
}
