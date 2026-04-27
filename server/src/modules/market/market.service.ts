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

@Injectable()
export class MarketService {
  constructor(
    @InjectRepository(MarketDepreciation)
    private readonly marketRepo: Repository<MarketDepreciation>,
    @Inject(forwardRef(() => AssetsService))
    private readonly assetsService: AssetsService,
  ) {}

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

  async findAll() {
    return await this.marketRepo.find({ order: { category_name: 'ASC' } });
  }

  async findOne(id: number) {
    const category = await this.marketRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Kategorija nije pronađena.');
    return category;
  }

  async update(id: number, dto: UpdateMarketDepreciationDto) {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    return await this.marketRepo.save(category);
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    await this.marketRepo.remove(category);
    return { message: 'Kategorija uspešno obrisana.' };
  }

  /**
   * Izračunava projektovanu vrednost aseta na osnovu parametara tržišta
   * @param assetId UUID aseta
   * @param targetYear Godina za koju želimo procenu (npr. 2029)
   */
  async calculateValuation(
    assetId: string,
    targetYear: number,
  ): Promise<number> {
    const asset = await this.assetsService.getAssetDetails(assetId);

    if (!asset.marketCategory) {
      throw new Error(
        'Asset nema dodeljenu tržišnu kategoriju za amortizaciju.',
      );
    }

    const currentYear = new Date().getFullYear();
    const yearsDiff = targetYear - currentYear;

    if (yearsDiff < 0) {
      throw new BadRequestException('Ciljna godina ne može biti u prošlosti.');
    }

    let projectedValue = Number(asset.total_price);

    const { year_1_pct, annual_avg_pct, is_appreciation } =
      asset.marketCategory;

    for (let i = 1; i <= yearsDiff; i++) {
      const currentRate = i === 1 ? Number(year_1_pct) : Number(annual_avg_pct);

      if (is_appreciation) {
        projectedValue = projectedValue * (1 + currentRate);
      } else {
        projectedValue = projectedValue * (1 - currentRate);
      }
    }

    return Math.round(projectedValue * 100) / 100;
  }
}
