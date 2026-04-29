import {
  Injectable,
  NotFoundException,
  ConflictException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceType } from './entities/maintenance-type.entity';
import { AssetMaintenance } from './entities/asset-maintenance.entity';
import { Insurance } from './entities/insurance.entity';
import { CreateMaintenanceTypeDto } from './dto/create-maintenance-type.dto';
import { CreateAssetMaintenanceDto } from './dto/create-asset-maintenance.dto';
import { CreateInsuranceDto } from './dto/create-insurance.dto';
import { AssetsService } from '../assets/assets.service';
import { Asset } from '../assets/entities/asset.entity';
import { MarketService } from '../market/market.service';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(MaintenanceType)
    private readonly typeRepo: Repository<MaintenanceType>,
    @InjectRepository(AssetMaintenance)
    private readonly maintenanceRepo: Repository<AssetMaintenance>,
    @InjectRepository(Insurance)
    private readonly insuranceRepo: Repository<Insurance>,
    @InjectRepository(Asset)
    private readonly assetRepo: Repository<Asset>,
    private readonly assetsService: AssetsService,
    @Inject(forwardRef(() => MarketService))
    private readonly marketService: MarketService,
  ) {}

  /**
   * Dodaje novi tip troška održavanja u šifarnik (npr. 'Mali servis', 'Registracija').
   * Sprečava dupliranje naziva u bazi podataka.
   * @param dto Podaci o nazivu i opisu tipa održavanja
   * @returns Kreirani MaintenanceType entitet
   */
  async addMaintenanceType(dto: CreateMaintenanceTypeDto) {
    const existing = await this.typeRepo.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException(
        `Tip održavanja '${dto.name}' već postoji u šifarniku.`,
      );
    }

    const newType = this.typeRepo.create(dto);
    return await this.typeRepo.save(newType);
  }

  /**
   * Povezuje konkretan aset sa troškom održavanja.
   * Proverava postojanje aseta i validnost tipa održavanja iz šifarnika.
   * @param dto Sadrži asset_id, tip troška, učestalost (meseci) i procenjenu cenu
   * @returns Snimljen AssetMaintenance entitet
   */
  async createMaintenance(dto: CreateAssetMaintenanceDto) {
    await this.assetsService.getAssetDetails(dto.asset_id);

    const type = await this.typeRepo.findOne({
      where: { id: dto.maintenance_type_id },
    });
    if (!type) {
      throw new NotFoundException(
        `Tip održavanja sa ID ${dto.maintenance_type_id} nije pronađen.`,
      );
    }

    const maintenance = this.maintenanceRepo.create(dto);
    return await this.maintenanceRepo.save(maintenance);
  }

  /**
   * Dodaje polisu osiguranja za određeni aset.
   * @param dto Podaci o tipu osiguranja i godišnjoj premiji
   * @returns Snimljen Insurance entitet
   */
  async createInsurance(dto: CreateInsuranceDto) {
    await this.assetsService.getAssetDetails(dto.asset_id);

    const insurance = this.insuranceRepo.create(dto);
    return await this.insuranceRepo.save(insurance);
  }

  /**
   * Dobavlja sve dostupne tipove održavanja iz baze podataka.
   * Koristi se primarno za popunjavanje dropdown menija na frontendu.
   * @returns Niz svih MaintenanceType entiteta
   */
  async findAllTypes() {
    return await this.typeRepo.find({ order: { name: 'ASC' } });
  }

  /**
   * Izračunava prosečan mesečni trošak (Holding Cost) aseta.
   * Sabira amortizovano godišnje osiguranje i sve periodične servise svedene na jedan mesec.
   * @param assetId UUID aseta koji se analizira
   * @returns Ukupan mesečni iznos troška zaokružen na dve decimale
   */
  async calculateMonthlyHoldingCost(assetId: string): Promise<number> {
    const asset = await this.assetRepo.findOne({
      where: { id: assetId },
      relations: ['insurances', 'maintenances'],
    });

    if (!asset) {
      throw new NotFoundException('Asset nije pronađen.');
    }

    const monthlyInsurance =
      asset.insurances.reduce((total, ins) => {
        return total + Number(ins.annual_premium);
      }, 0) / 12;

    const monthlyMaintenance = asset.maintenances.reduce((total, maint) => {
      const cost = Number(maint.estimated_cost);
      const frequency = maint.frequency_months;
      return total + cost / frequency;
    }, 0);

    const totalMonthlyCost = monthlyInsurance + monthlyMaintenance;

    return Math.round(totalMonthlyCost * 100) / 100;
  }

  /**
   * Generiše detaljan finansijski izveštaj o troškovima aseta.
   * Grupiše podatke po tipovima radi lakše vizuelizacije na frontendu (npr. Pie Chart).
   * @param assetId UUID aseta
   * @returns Objekat sa strukturom troškova, valutom i sumarnim podacima
   */
  async getAssetFinancialProfile(assetId: string) {
    const monthlyHoldingCost = await this.calculateMonthlyHoldingCost(assetId);

    const asset = await this.assetRepo.findOne({
      where: { id: assetId },
      relations: ['insurances', 'maintenances', 'maintenances.maintenanceType'],
    });

    if (!asset) throw new NotFoundException('Asset nije pronađen.');

    const maintenanceBreakdown = asset.maintenances.map((m) => ({
      type: m.maintenanceType.name,
      monthly_impact:
        Math.round((Number(m.estimated_cost) / m.frequency_months) * 100) / 100,
      full_cost: Number(m.estimated_cost),
      frequency: `${m.frequency_months} meseci`,
    }));

    const insuranceBreakdown = asset.insurances.map((i) => ({
      type: i.insurance_type,
      monthly_impact: Math.round((Number(i.annual_premium) / 12) * 100) / 100,
      full_cost: Number(i.annual_premium),
    }));

    return {
      asset_id: assetId,
      total_monthly_holding_cost: monthlyHoldingCost,
      currency: asset.currency,
      breakdown: {
        maintenances: maintenanceBreakdown,
        insurances: insuranceBreakdown,
      },
      summary: {
        insurance_total_monthly: insuranceBreakdown.reduce(
          (s, i) => s + i.monthly_impact,
          0,
        ),
        maintenance_total_monthly: maintenanceBreakdown.reduce(
          (s, m) => s + m.monthly_impact,
          0,
        ),
      },
    };
  }

  /**
   * Projektuje ukupnu cenu vlasništva (Real Cost of Ownership) za određeni period.
   * Uzima u obzir pad tržišne vrednosti (deprecijaciju) i kumulativne troškove održavanja.
   * @param assetId UUID aseta
   * @param years Broj godina za koje se vrši projekcija
   * @returns Analiza gubitka vrednosti, troškova održavanja i prosečnog mesečnog opterećenja
   */
  async getProjectedTotalCost(assetId: string, years: number) {
    const asset = await this.assetsService.getAssetDetails(assetId);
    const initialValue = Number(asset.total_price);

    const monthlyCost = await this.calculateMonthlyHoldingCost(assetId);
    const totalMaintenanceOverPeriod = monthlyCost * (years * 12);

    const targetYear = new Date().getFullYear() + years;
    const futureValue = await this.marketService.calculateValuation(
      assetId,
      targetYear,
    );

    const depreciation = initialValue - futureValue;
    const totalOwnershipCost = depreciation + totalMaintenanceOverPeriod;

    return {
      period_years: years,
      initial_asset_value: initialValue,
      projected_market_value: futureValue,
      total_maintenance_costs:
        Math.round(totalMaintenanceOverPeriod * 100) / 100,
      real_cost_of_ownership: Math.round(totalOwnershipCost * 100) / 100,
      monthly_average_all_included:
        Math.round((totalOwnershipCost / (years * 12)) * 100) / 100,
    };
  }
}
