import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndexRate } from '../../entities/index-rate.entity';
import {
  CreateIndexRateDto,
  UpdateIndexRateDto,
} from '../../dto/create-index-rate.dto';

@Injectable()
export class IndexRatesService {
  constructor(
    @InjectRepository(IndexRate)
    private readonly indexRateRepo: Repository<IndexRate>,
  ) {}

  /**
   * Kreira novu referentnu kamatnu stopu (npr. EURIBOR, BELIBOR).
   *
   * @param dto - Podaci o nazivu i početnoj vrednosti stope
   * @returns Kreirana stopa
   * @throws ConflictException - Ako stopa sa tim imenom već postoji
   */
  async create(dto: CreateIndexRateDto) {
    const existing = await this.indexRateRepo.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Referentna stopa ${dto.name} već postoji.`);
    }
    const rate = this.indexRateRepo.create(dto);
    return await this.indexRateRepo.save(rate);
  }

  /**
   * Dobavlja sve referentne stope iz sistema.
   *
   * @returns Niz svih stopa sa njihovim trenutnim vrednostima
   */
  async findAll() {
    return await this.indexRateRepo.find();
  }

  /**
   * Pronalazi specifičnu stopu na osnovu ID-ja.
   *
   * @param id - UUID stope
   * @returns Objekat referentne stope
   * @throws NotFoundException - Ako stopa nije pronađena
   */
  async findOne(id: string) {
    const rate = await this.indexRateRepo.findOne({ where: { id } });
    if (!rate) throw new NotFoundException('Referentna stopa nije pronađena');
    return rate;
  }

  /**
   * Ažurira vrednost referentne stope.
   * Svako ažuriranje automatski menja 'last_updated' tajmstamp.
   *
   * @param id - UUID stope
   * @param dto - Nova vrednost stope
   * @returns Ažurirana stopa
   */
  async update(id: string, dto: UpdateIndexRateDto) {
    const rate = await this.findOne(id);
    Object.assign(rate, dto);
    return await this.indexRateRepo.save(rate);
  }

  /**
   * Briše referentnu stopu.
   *
   * @param id - UUID stope
   * @throws NotFoundException - Ako stopa ne postoji
   */
  async remove(id: string) {
    const rate = await this.findOne(id);
    return await this.indexRateRepo.remove(rate);
  }
}
