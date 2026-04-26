import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, OneToOne } from 'typeorm';
import { IndividualProfile } from './individual-profile.entity';
import { BusinessProfile } from './business-profile.entity';

export enum UserRole {
  ADMIN = 'admin',
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
}

export enum AuthMethod {
  PASSWORD = 'password',
  MAGIC_LINK = 'magic_link',
  BIOMETRIC = 'biometric',
}

export interface ActiveUserData {
  userId: string;
  email: string;
  role: string;
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  password_hash!: string;

  @Column({ type: 'enum', enum: AuthMethod, default: AuthMethod.PASSWORD })
  auth_method!: AuthMethod;

  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole;

  @Column({ default: true })
  isActive!: boolean;

  @OneToOne(() => IndividualProfile, (ip) => ip.user)
  individualProfile?: IndividualProfile;

  @OneToOne(() => BusinessProfile, (bp) => bp.user)
  businessProfile?: BusinessProfile;
}
