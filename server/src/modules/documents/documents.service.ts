import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentType } from './entities/document-types.entity';
import { DocumentStatus, UserDocument } from './entities/user-document.entity';
import { CreateUserDocumentDto } from './dto/create-user-document.dto';
import { VerifyDocumentDto } from './dto/verify-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DocumentType)
    private readonly docTypeRepo: Repository<DocumentType>,

    @InjectRepository(UserDocument)
    private readonly userDocRepo: Repository<UserDocument>,
  ) {}

  async createType(dto: CreateDocumentTypeDto) {
    const codeFormatted = dto.code.toUpperCase();

    const existing = await this.docTypeRepo.findOne({
      where: [{ code: codeFormatted }, { name: dto.name }],
    });

    if (existing) {
      const conflictField =
        existing.code === codeFormatted ? 'kodom' : 'imenom';
      throw new ConflictException(
        `Tip dokumenta sa tim ${conflictField} već postoji.`,
      );
    }

    const newType = this.docTypeRepo.create({
      ...dto,
      code: codeFormatted,
    });

    await this.docTypeRepo.save(newType);

    return {
      success: true,
      message: `Tip dokumenta "${dto.name}" je uspešno kreiran pod kodom ${codeFormatted}.`,
    };
  }

  async findAllTypes(): Promise<DocumentType[]> {
    return await this.docTypeRepo.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async updateType(id: number, dto: Partial<CreateDocumentTypeDto>) {
    const type = await this.docTypeRepo.findOne({ where: { id } });
    if (!type) throw new NotFoundException('Tip dokumenta nije pronađen.');

    if (dto.code) {
      const codeUpper = dto.code.toUpperCase();
      const existing = await this.docTypeRepo.findOne({
        where: { code: codeUpper },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Kod ${codeUpper} je već u upotrebi.`);
      }
      type.code = codeUpper;
    }

    Object.assign(type, dto);
    await this.docTypeRepo.save(type);

    return { success: true, message: 'Tip dokumenta je uspešno ažuriran.' };
  }

  async deleteType(id: number) {
    const type = await this.docTypeRepo.findOne({ where: { id } });
    if (!type) throw new NotFoundException('Tip dokumenta ne postoji.');

    try {
      await this.docTypeRepo.delete(id);
      return { success: true, message: 'Tip dokumenta je obrisan.' };
    } catch (error) {
      console.error(error);
      throw new ConflictException(
        'Ne možete obrisati tip koji korisnici već koriste. Razmislite o deaktivaciji.',
      );
    }
  }

  async uploadUserDocument(dto: CreateUserDocumentDto, userId: string) {
    const docType = await this.docTypeRepo.findOne({
      where: { id: dto.doc_type_id },
    });
    if (!docType) throw new NotFoundException('Tip dokumenta ne postoji.');

    const pendingDoc = await this.userDocRepo.findOne({
      where: {
        user_id: userId,
        doc_type_id: dto.doc_type_id,
        status: DocumentStatus.PENDING,
      },
    });

    if (pendingDoc) {
      throw new ConflictException(
        `Već imate dokument "${docType.name}" koji čeka na pregled. Ne možete poslati novi dok admin ne obradi postojeći.`,
      );
    }

    const newUserDoc = this.userDocRepo.create({
      user_id: userId,
      doc_type_id: dto.doc_type_id,
      file_url: dto.file_url,
      status: DocumentStatus.PENDING,
    });

    await this.userDocRepo.save(newUserDoc);

    return {
      success: true,
      message: `Novi dokument "${docType.name}" je uspešno poslat na verifikaciju.`,
    };
  }

  async verifyDocument(id: string, dto: VerifyDocumentDto) {
    const document = await this.userDocRepo.findOne({
      where: { id },
      relations: ['type'],
    });

    if (!document) {
      throw new NotFoundException('Dokument nije pronađen.');
    }

    document.status = dto.status;
    document.rejection_reason =
      dto.status === DocumentStatus.REJECTED
        ? (dto.rejection_reason ?? null)
        : null;

    await this.userDocRepo.save(document);

    const statusMessage =
      dto.status === DocumentStatus.VERIFIED ? 'odobren' : 'odbijen';

    return {
      success: true,
      message: `Dokument "${document.type.name}" je uspešno ${statusMessage}.`,
    };
  }

  async findUserDocuments(userId: string) {
    return await this.userDocRepo.find({
      where: { user_id: userId },
      relations: ['type'],
      order: { uploaded_at: 'DESC' },
    });
  }

  async findAllPending() {
    return await this.userDocRepo.find({
      where: { status: DocumentStatus.PENDING },
      relations: ['user', 'type'],
      order: { uploaded_at: 'ASC' },
    });
  }

  async findOneDocument(id: string) {
    const doc = await this.userDocRepo.findOne({
      where: { id },
      relations: ['user', 'type'],
    });

    if (!doc) throw new NotFoundException('Dokument nije pronađen.');
    return doc;
  }
}
