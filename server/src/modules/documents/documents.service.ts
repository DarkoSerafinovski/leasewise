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

  /**
   * Kreira novi tip dokumenta u sistemu (npr. 'Lična karta', 'Ugovor o radu').
   * Vrši proveru jedinstvenosti koda i imena dokumenta.
   * @param dto Podaci o nazivu, kodu i zahtevima dokumenta
   * @returns Objekat sa statusom uspeha i generisanom porukom
   * @throws ConflictException ako kod ili ime već postoje
   */
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

  /**
   * Dobavlja listu svih definisanih tipova dokumenata.
   * @returns Niz DocumentType entiteta sortiranih po abecedi
   */
  async findAllTypes(): Promise<DocumentType[]> {
    return await this.docTypeRepo.find({
      order: {
        name: 'ASC',
      },
    });
  }

  /**
   * Ažurira postojeći tip dokumenta.
   * @param id Numerički ID tipa dokumenta
   * @param dto Delimični podaci za izmenu
   * @returns Status poruka o uspehu
   * @throws NotFoundException ako tip ne postoji
   */
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

  /**
   * Briše tip dokumenta iz šifarnika.
   * Onemogućava brisanje ako postoje korisnički dokumenti vezani za ovaj tip.
   * @param id ID tipa dokumenta
   * @returns Status poruka o uspehu
   * @throws ConflictException u slučaju narušavanja stranog ključa (FK)
   */
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

  /**
   * Omogućava korisniku da pošalje dokument na verifikaciju.
   * Sprečava slanje duplih dokumenata istog tipa dok je prethodni još u obradi.
   * @param dto Sadrži ID tipa dokumenta i URL fajla (npr. sa S3 ili Cloudinary)
   * @param userId UUID korisnika koji šalje dokument
   * @returns Poruka o uspešnom slanju
   * @throws ConflictException ako već postoji dokument na čekanju (PENDING)
   */
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

  /**
   * Administrativna metoda za odobravanje ili odbijanje dokumenta.
   * U slučaju odbijanja, obavezno je navesti razlog (rejection_reason).
   * @param id UUID korisničkog dokumenta
   * @param dto Novi status i opcioni razlog odbijanja
   * @returns Detalji o ishodu verifikacije
   */
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

  /**
   * Dobavlja istoriju svih dokumenata koje je određeni korisnik poslao.
   * @param userId UUID korisnika
   * @returns Niz dokumenata sortiranih od najnovijeg
   */
  async findUserDocuments(userId: string) {
    return await this.userDocRepo.find({
      where: { user_id: userId },
      relations: ['type'],
      order: { uploaded_at: 'DESC' },
    });
  }

  /**
   * Dobavlja sve dokumente iz sistema koji čekaju na admin verifikaciju.
   * Koristi se za admin dashboard (red čekanja).
   * @returns Niz dokumenata sa uključenim podacima o korisniku i tipu
   */
  async findAllPending() {
    return await this.userDocRepo.find({
      where: { status: DocumentStatus.PENDING },
      relations: ['user', 'type'],
      order: { uploaded_at: 'ASC' },
    });
  }

  /**
   * Dobavlja detaljne informacije o jednom specifičnom dokumentu.
   * @param id UUID dokumenta
   * @returns UserDocument sa svim relacijama ili baca NotFoundException
   */
  async findOneDocument(id: string) {
    const doc = await this.userDocRepo.findOne({
      where: { id },
      relations: ['user', 'type'],
    });

    if (!doc) throw new NotFoundException('Dokument nije pronađen.');
    return doc;
  }
}
