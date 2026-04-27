import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { DocumentStatus } from '../entities/user-document.entity';

export class VerifyDocumentDto {
  @IsEnum(DocumentStatus)
  @IsNotEmpty()
  status!: DocumentStatus;

  @ValidateIf((o) => o.status === DocumentStatus.REJECTED)
  @IsNotEmpty({ message: 'Morate navesti razlog odbijanja dokumenta.' })
  @IsString()
  rejection_reason?: string;
}
