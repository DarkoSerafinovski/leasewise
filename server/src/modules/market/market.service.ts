import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MarketDepreciation } from './entities/market-depreciation.entity';
import { Repository } from 'typeorm';
import { CreateMarketDepreciationDto } from './dto/create-market-depreciation.dto';
import { UpdateMarketDepreciationDto } from './dto/update-market-depreciation.dto';
import { AssetsService } from '../assets/assets.service';
import { MaintenanceService } from '../maintenances/maintenances.service';

@Injectable()
export class MarketService {
  constructor(
    @InjectRepository(MarketDepreciation)
    private readonly marketRepo: Repository<MarketDepreciation>,
    private readonly assetsService: AssetsService,
    @Inject(forwardRef(() => MaintenanceService))
    private readonly maintenanceService: MaintenanceService,
  ) {}

  /**
   * Kreira novu kategoriju za amortizaciju/aprecijaciju tržišne vrednosti.
   * Proverava da li kategorija sa istim imenom već postoji pre čuvanja.
   * @param dto Podaci za kreiranje kategorije (ime, procenti, tip rasta/pada)
   * @returns Snimljen entitet kategorije
   */

  async create(dto: CreateMarketDepreciationDto) {
    const existing = await this.marketRepo.findOne({
      where: { category_name: dto.category_name },
    });
    if (existing) {
      throw new ConflictException(
        `Kategorija '${dto.category_name}' već postoji.`,
      );
    }

    const category = this.marketRepo.create(dto);
    return await this.marketRepo.save(category);
  }

  /**
   * Dobavlja listu svih definisanih kategorija tržišnih kretanja.
   * @returns Niz MarketDepreciation entiteta poređanih po imenu (A-Z)
   */

  async findAll() {
    return await this.marketRepo.find({ order: { category_name: 'ASC' } });
  }

  /**
   * Pronalazi specifičnu kategoriju na osnovu njenog ID-a.
   * @param id Jedinstveni ID kategorije
   * @returns Pronađeni entitet ili baca NotFoundException
   */

  async findOne(id: number) {
    const category = await this.marketRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Kategorija nije pronađena.');
    return category;
  }

  /**
   * Ažurira parametre postojeće kategorije tržišnih kretanja.
   * @param id ID kategorije koja se menja
   * @param dto Delimični ili potpuni podaci za ažuriranje
   * @returns Ažuriran entitet
   */
  async update(id: number, dto: UpdateMarketDepreciationDto) {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    return await this.marketRepo.save(category);
  }

  /**
   * Uklanja kategoriju tržišnih kretanja iz baze podataka.
   * @param id ID kategorije za brisanje
   * @returns Poruka o uspešnom brisanju
   */
  async remove(id: number) {
    const category = await this.findOne(id);
    await this.marketRepo.remove(category);
    return { message: 'Kategorija uspešno obrisana.' };
  }

  /**
   * Računa projektovanu tržišnu vrednost imovine za zadatu godinu.
   * Logika uzima u obzir tržišnu kategoriju (amortizacija ili apresijacija)
   * i koriguje stopu pada vrednosti ukoliko postoje dokazi o održavanju imovine.
   * * @param assetId UUID aseta koji se procenjuje
   * @param targetYear Godina za koju se vrši projekcija (mora biti >= tekuće)
   * @returns Projektovana numerička vrednost zaokružena na dve decimale
   * @throws Error ako aset nema definisanu tržišnu kategoriju
   * @throws BadRequestException ako je ciljna godina u prošlosti
   */
  async calculateValuation(
    assetId: string,
    targetYear: number,
  ): Promise<number> {
    const asset = await this.assetsService.getAssetDetails(assetId);

    if (!asset.marketCategory) {
      throw new Error('Asset nema dodeljenu tržišnu kategoriju.');
    }

    const financialProfile =
      await this.maintenanceService.getAssetFinancialProfile(assetId);
    const hasMaintenance =
      financialProfile.breakdown.maintenances.length > 0 ||
      financialProfile.breakdown.insurances.length > 0;

    const currentYear = new Date().getFullYear();
    const yearsDiff = targetYear - currentYear;

    if (yearsDiff < 0) throw new BadRequestException('Godina je u prošlosti.');

    let projectedValue = Number(asset.total_price);
    const { year_1_pct, annual_avg_pct, is_appreciation } =
      asset.marketCategory;

    for (let i = 1; i <= yearsDiff; i++) {
      let currentRate = i === 1 ? Number(year_1_pct) : Number(annual_avg_pct);

      if (!is_appreciation && hasMaintenance) {
        currentRate = currentRate * 0.8;
      }

      projectedValue = is_appreciation
        ? projectedValue * (1 + currentRate)
        : projectedValue * (1 - currentRate);
    }

    return Math.round(projectedValue * 100) / 100;
  }
}
