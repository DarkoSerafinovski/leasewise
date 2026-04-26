import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('business_profile')
export class BusinessProfile {
  @PrimaryColumn()
  user_id!: string;

  @OneToOne(() => User, (u) => u.businessProfile)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  company_name!: string;

  @Column({ unique: true })
  pib!: string;

  @Column({ unique: true })
  registration_number!: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  annual_revenue!: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  ebitda!: number;

  @Column({ type: 'boolean', default: false })
  is_tax_payer!: boolean;

  @Column()
  founded_date!: Date;
}
