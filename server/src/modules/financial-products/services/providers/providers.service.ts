import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from '../../entities/provider.entity';
import {
  CreateProviderDto,
  UpdateProviderDto,
} from '../../dto/create-provider.dto';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,
  ) {}

  /**
   * Kreira novog finansijskog provajdera (npr. banku ili lizing kuću).
   *
   * @param dto - Podaci za kreiranje provajdera (ime, logo, sajt)
   * @returns Kreirani provajder snimljen u bazi
   * @throws ConflictException - Ako provajder sa istim imenom već postoji
   */
  async create(dto: CreateProviderDto) {
    const existing = await this.providerRepo.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Provajder sa tim imenom već postoji');
    }
    const provider = this.providerRepo.create(dto);
    return await this.providerRepo.save(provider);
  }

  /**
   * Dobavlja listu svih provajdera sa njihovim povezanim finansijskim proizvodima.
   *
   * @returns Niz svih provajdera iz baze
   */
  async findAll() {
    return await this.providerRepo.find({ relations: ['products'] });
  }

  /**
   * Pronalazi jednog specifičnog provajdera na osnovu ID-ja.
   *
   * @param id - UUID provajdera
   * @returns Objekat provajdera sa listom njegovih proizvoda
   * @throws NotFoundException - Ako provajder sa tim ID-jem ne postoji
   */
  async findOne(id: string) {
    const provider = await this.providerRepo.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!provider) throw new NotFoundException('Provajder nije pronađen');
    return provider;
  }

  /**
   * Ažurira podatke postojećeg provajdera.
   *
   * @param id - UUID provajdera kojeg menjamo
   * @param dto - Delimični ili potpuni podaci za izmenu
   * @returns Ažurirani provajder snimljen u bazi
   * @throws NotFoundException - Ako provajder ne postoji
   */
  async update(id: string, dto: UpdateProviderDto) {
    const provider = await this.findOne(id);
    Object.assign(provider, dto);
    return await this.providerRepo.save(provider);
  }

  /**
   * Briše provajdera iz baze podataka.
   * Napomena: Zbog relacionih veza, brisanje može biti onemogućeno ako provajder ima proizvode.
   *
   * @param id - UUID provajdera za brisanje
   * @returns Obrisani objekat provajdera
   * @throws NotFoundException - Ako provajder ne postoji
   */
  async remove(id: string) {
    const provider = await this.findOne(id);
    return await this.providerRepo.remove(provider);
  }
}
