import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DocumentType } from './document-types.entity';

export enum DocumentStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Entity('user_documents')
export class UserDocument {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  user_id!: string;

  @Column()
  doc_type_id!: number;

  @Column()
  file_url!: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status!: DocumentStatus;

  @Column({ nullable: true })
  rejection_reason!: string | null;

  @CreateDateColumn()
  uploaded_at!: Date;

  @ManyToOne(() => User, (u) => u.documents)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => DocumentType, (d) => d.documents)
  @JoinColumn({ name: 'doc_type_id' })
  type!: DocumentType;
}
