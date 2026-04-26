import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('individual_profile')
export class IndividualProfile {
  @PrimaryColumn()
  user_id!: string;

  @OneToOne(() => User, (u) => u.individualProfile)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  first_name!: string;

  @Column()
  last_name!: string;

  @Column({ unique: true })
  jmbg!: string;

  @Column({ type: 'enum', enum: ['employed', 'self_employed', 'unemployed'] })
  employment_status!: string;

  @Column()
  employment_start_date!: Date;

  @Column()
  is_permanently_employed!: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  monthly_net_income!: number;
}
