import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditScoreCategory } from './entities/credit-score-category.entity';
import {
  CreateCreditScoreCategoryDto,
  UpdateCreditScoreCategoryDto,
} from './dto/create-category.dto';
import { CreditSnapshot } from './entities/credit-snapshot.entity';
import { User } from '../users/entities/user.entity';
import { FinancialProduct } from '../financial-products/entities/financial-product.entity';
import { EvaluateCreditDto } from './dto/evaluate-credit.dto';

@Injectable()
export class CreditScoreService {
  constructor(
    @InjectRepository(CreditScoreCategory)
    private readonly categoryRepo: Repository<CreditScoreCategory>,

    @InjectRepository(CreditSnapshot)
    private readonly snapshotRepo: Repository<CreditSnapshot>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(FinancialProduct)
    private readonly productRepo: Repository<FinancialProduct>,
  ) {}

  async createCategory(
    dto: CreateCreditScoreCategoryDto,
  ): Promise<CreditScoreCategory> {
    const existing = await this.categoryRepo.findOne({
      where: { grade: dto.grade },
    });
    if (existing) {
      throw new ConflictException(
        `Kategorija boniteta sa oznakom '${dto.grade}' već postoji.`,
      );
    }

    try {
      const category = this.categoryRepo.create(dto);
      return await this.categoryRepo.save(category);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Greška pri pokušaju čuvanja nove kategorije u bazi.',
      );
    }
  }

  async findAllCategories(): Promise<CreditScoreCategory[]> {
    return await this.categoryRepo.find({
      order: { min_score_threshold: 'DESC' },
    });
  }

  async findOneCategory(id: number): Promise<CreditScoreCategory> {
    const category = await this.categoryRepo.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(
        `Kreditna kategorija sa ID-jem ${id} nije pronađena.`,
      );
    }

    return category;
  }

  async updateCategory(
    id: number,
    dto: UpdateCreditScoreCategoryDto,
  ): Promise<CreditScoreCategory> {
    const category = await this.findOneCategory(id);

    try {
      const updatedCategory = Object.assign(category, dto);
      return await this.categoryRepo.save(updatedCategory);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        `Neuspešno ažuriranje kategorije sa ID-jem ${id}.`,
      );
    }
  }

  async toggleCategoryActivation(categoryId: number) {
    const category = await this.categoryRepo.findOneBy({ id: categoryId });
    if (!category) throw new NotFoundException('Kateogrija nije pronađena');

    category.is_active = !category.is_active;
    return await this.categoryRepo.save(category);
  }

  async removeCategory(
    id: number,
  ): Promise<{ deleted: boolean; message: string }> {
    const category = await this.findOneCategory(id);

    try {
      await this.categoryRepo.remove(category);
      return {
        deleted: true,
        message: `Kategorija '${category.grade}' je uspešno uklonjena.`,
      };
    } catch (error) {
      console.error(error);
      throw new ConflictException(
        'Nije moguće obrisati kategoriju jer postoje podaci koji zavise od nje.',
      );
    }
  }

  private async determineCategory(dti: number): Promise<CreditScoreCategory> {
    const categories = await this.categoryRepo.find();
    return (
      categories.find((c) => dti <= c.max_score_threshold) ||
      categories[categories.length - 1]
    );
  }

  async findByUserId(userId: string): Promise<CreditSnapshot[]> {
    return await this.snapshotRepo.find({
      where: { user_id: userId },
      relations: ['product', 'score_category'],
      order: { created_at: 'DESC' },
    });
  }

  async findOneSnapshot(id: string): Promise<CreditSnapshot> {
    const snapshot = await this.snapshotRepo.findOne({
      where: { id },
      relations: ['user', 'product', 'score_category'],
    });

    if (!snapshot) {
      throw new NotFoundException(`Snapshot sa ID-jem ${id} nije pronađen.`);
    }

    return snapshot;
  }

  async removeSnapshot(id: string): Promise<{ message: string }> {
    const snapshot = await this.findOneSnapshot(id);
    await this.snapshotRepo.remove(snapshot);
    return { message: 'Zapis o kreditnoj proveri je uspešno obrisan.' };
  }

  async evaluateCreditWorthiness(
    userId: string,
    dto: EvaluateCreditDto,
  ): Promise<CreditSnapshot> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['individualProfile', 'businessProfile'],
    });

    const product = await this.productRepo.findOne({
      where: { id: dto.productId },
      relations: ['conditions', 'tax_rules', 'eligibility_rules'],
    });

    if (!user || !product)
      throw new NotFoundException('Korisnik ili proizvod nisu pronađeni');

    if (
      user.individualProfile &&
      !user.individualProfile.is_permanently_employed
    ) {
      return await this.saveRejectedSnapshot(
        user.id,
        product,
        'Klijent mora biti zaposlen na neodređeno vreme.',
      );
    }

    const rule = product.eligibility_rules[0];
    if (rule) {
      if (
        dto.requestedAmount < Number(rule.min_asset_value) ||
        dto.requestedAmount > Number(rule.max_asset_value)
      ) {
        throw new BadRequestException(
          `Iznos mora biti između ${rule.min_asset_value} i ${rule.max_asset_value} ${product.currency}`,
        );
      }
    }

    let netIncomeAtTime = 0;
    let externalDebt = 0;

    if (user.individualProfile) {
      netIncomeAtTime = Number(user.individualProfile.monthly_net_income);
      externalDebt = Number(user.individualProfile.external_monthly_debt);
    } else if (user.businessProfile) {
      netIncomeAtTime = Number(user.businessProfile.ebitda) / 12;
      externalDebt = Number(user.businessProfile.external_monthly_debt);
    }

    const principal = dto.requestedAmount - dto.downPaymentAmount;
    const monthlyRate =
      Number(product.conditions.effective_interest_rate) / 100 / 12;
    const n = dto.tenureMonths;

    const simulatedInstallment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
      (Math.pow(1 + monthlyRate, n) - 1);

    const internalActiveDebt = await this.calculateInternalActiveDebt(userId);
    const totalDebtAtTime =
      externalDebt + internalActiveDebt + simulatedInstallment;
    const dtiRatio = (totalDebtAtTime / netIncomeAtTime) * 100;
    const maxAllowedDti = Number(product.max_dti_allowed) * 100;

    const category = await this.determineCategory(dtiRatio);

    let rejectionReason;
    if (dtiRatio > maxAllowedDti) {
      rejectionReason = `Prekoračen limit zaduženja. Maksimalno dozvoljeno: ${maxAllowedDti}%, Vaše trenutno opterećenje: ${dtiRatio.toFixed(2)}%. Valuta proizvoda: ${product.currency}`;
    }

    const snapshot = this.snapshotRepo.create({
      user_id: userId,
      product_id: product.id,
      score_category_id: category.id,
      net_income_at_time: netIncomeAtTime,
      total_debt_at_time: totalDebtAtTime,
      dti_ratio_at_time: dtiRatio,
      max_approved_monthly_installment: simulatedInstallment,
      is_eligible: dtiRatio <= maxAllowedDti,
      is_active_engagement: false,
      rejection_reason: rejectionReason,
    });

    return await this.snapshotRepo.save(snapshot);
  }

  private async saveRejectedSnapshot(
    userId: string,
    product: any,
    reason: string,
  ): Promise<CreditSnapshot> {
    const worstCategory = await this.categoryRepo.findOne({
      order: { max_score_threshold: 'DESC' },
    });

    const snapshot = this.snapshotRepo.create({
      user_id: userId,
      product_id: product.id,
      score_category_id: worstCategory?.id || 1,
      net_income_at_time: 0,
      total_debt_at_time: 0,
      dti_ratio_at_time: 100,
      max_approved_monthly_installment: 0,
      is_eligible: false,
      is_active_engagement: false,
      rejection_reason: reason,
    });

    return await this.snapshotRepo.save(snapshot);
  }

  private async calculateInternalActiveDebt(userId: string): Promise<number> {
    const activeScores = await this.snapshotRepo.find({
      where: { user_id: userId, is_active_engagement: true },
    });
    return activeScores.reduce(
      (sum, score) => sum + Number(score.max_approved_monthly_installment),
      0,
    );
  }

  async toggleSnapshotEngagement(snapshotId: string, isActive: boolean) {
    const snapshot = await this.snapshotRepo.findOneBy({ id: snapshotId });
    if (!snapshot) throw new NotFoundException('Snapshot nije pronađen');

    snapshot.is_active_engagement = isActive;
    return await this.snapshotRepo.save(snapshot);
  }
}
