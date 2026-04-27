import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentDto } from './create-document-type.dto';

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {}
