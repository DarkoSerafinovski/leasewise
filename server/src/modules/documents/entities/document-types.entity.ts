import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserDocument } from './user-document.entity';

@Entity('document_types')
export class DocumentType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ unique: true })
  code!: string;

  @Column({ default: false })
  is_mandatory!: boolean;

  @OneToMany(() => UserDocument, (ud) => ud.type)
  documents!: UserDocument[];
}
