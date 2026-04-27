import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { InvestmentProfile } from './investment-profile.entity';

@Entity('experience_levels')
export class ExperienceLevel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column()
  access_level!: number;

  @OneToMany(() => InvestmentProfile, (ip) => ip.risk_tolerance)
  profile!: InvestmentProfile;
}
