import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { FinancialProduct } from '../../entities/financial-product.entity';
import { CalculateAnalysisDto } from '../../dto/calculate-analysis.dto';

import {
  CreateFullProductDto,
  UpdateFullProductDto,
} from '../../dto/create-full-product.dto';
import { ProductCondition } from '../../entities/product-condition.entity';
import { ProductEligibility } from '../../entities/product-eligibility.entity';
import { TaxShieldRule } from '../../entities/tax-shield-rule.entity';

@Injectable()
export class FinancialProductsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(FinancialProduct)
    private readonly productRepo: Repository<FinancialProduct>,
  ) {}

  /**
   * Kreira kompletan finansijski proizvod i sve njegove relacije u jednoj transakciji.
   * Redosled: Product -> Conditions -> Eligibility -> TaxRules
   *
   * @param dto - Objekat sa svim podacima za lizing proizvod
   * @returns Kreirani FinancialProduct sa svim povezanim entitetima
   */
  async createFullProduct(dto: CreateFullProductDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = queryRunner.manager.create(FinancialProduct, {
        provider_id: dto.providerId,
        product_type: dto.product_type,
        max_dti_allowed: dto.max_dti_allowed,
        currency: dto.currency,
        is_active: true,
      });
      const savedProduct = await queryRunner.manager.save(product);

      const conditions = queryRunner.manager.create(ProductCondition, {
        ...dto.conditions,
        product_id: savedProduct.id,
      });
      await queryRunner.manager.save(conditions);

      const eligibility = queryRunner.manager.create(ProductEligibility, {
        ...dto.eligibility,
        product: savedProduct,
      });
      await queryRunner.manager.save(eligibility);

      const taxRules = queryRunner.manager.create(TaxShieldRule, {
        ...dto.taxRules,
        product_id: savedProduct.id,
      });
      await queryRunner.manager.save(taxRules);

      await queryRunner.commitTransaction();

      return savedProduct;
    } catch (err) {
      await queryRunner.rollbackTransaction();

      const errorMessage =
        err instanceof Error ? err.message : 'Nepoznata greška';

      throw new InternalServerErrorException(
        `Greška pri kreiranju kompletnog proizvoda: ${errorMessage}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Izračunava osnovni amortizacioni plan za finansijski proizvod.
   * Uzima u obzir varijabilne kamatne stope u odnosu na referentne marketinške stope (npr. EURIBOR).
   *
   * @param productId - UUID finansijskog proizvoda
   * @param assetPrice - Ukupna nabavna vrednost imovine (auta, mašine itd.)
   * @param downPayment - Iznos učešća koji klijent plaća unapred
   * @returns Objekat sa mesečnom ratom, ukupnom otplatom i kamatom
   * @throws NotFoundException ako proizvod ili uslovi ne postoje u bazi
   */
  async calculateAmortizationPlan(
    productId: string,
    query: CalculateAnalysisDto,
  ) {
    const { assetPrice, downPayment } = query;
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: ['conditions', 'conditions.index_rate_ref'],
    });

    if (!product) {
      throw new NotFoundException('Finansijski proizvod nije pronađen');
    }

    if (!product.conditions) {
      throw new NotFoundException(
        'Tehnički uslovi (kamata, period otplate) za ovaj proizvod nisu definisani',
      );
    }

    const { conditions } = product;
    const principal = assetPrice - downPayment;

    let annualRate = Number(conditions.nominal_interest_rate);

    if (conditions.is_variable && conditions.index_rate_ref) {
      annualRate += Number(conditions.index_rate_ref.current_value);
    }

    const monthlyRate = annualRate / 100 / 12;
    const months = conditions.max_tenure_months;

    const monthlyPayment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
      (Math.pow(1 + monthlyRate, months) - 1);

    return {
      monthlyPayment: Number(monthlyPayment.toFixed(2)),
      totalRepayment: Number((monthlyPayment * months).toFixed(2)),
      totalInterest: Number((monthlyPayment * months - principal).toFixed(2)),
      principal,
      annualRate,
    };
  }

  /**
   * Izračunava poreske uštede (Tax Shield) na osnovu tipa finansiranja.
   * Obuhvata povrat PDV-a i umanjenje poreza na dobit pravnih lica.
   *
   * @param productId - UUID finansijskog proizvoda
   * @param monthlyPayment - Bruto mesečna rata dobijena iz amortizacionog plana
   * @returns Detaljan prikaz ušteda i neto mesečnog troška
   * @throws NotFoundException ako proizvod ili poreska pravila nisu konfigurisana
   */
  async calculateTaxBenefits(productId: string, monthlyPayment: number) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: ['tax_rules'],
    });

    if (!product) {
      throw new NotFoundException(
        `Proizvod sa ID-jem ${productId} nije pronađen.`,
      );
    }

    if (!product.tax_rules) {
      throw new NotFoundException(
        'Poreska pravila (Tax Shield rules) nisu konfigurisana za ovaj proizvod',
      );
    }

    const { tax_rules } = product;
    const corporateTaxRate = 0.15;

    const vatSavings =
      monthlyPayment * (Number(tax_rules.vat_deductible_pct) / 100);

    const taxableExpense =
      (monthlyPayment - vatSavings) *
      (Number(tax_rules.expense_recognition_pct) / 100);

    const incomeTaxSavings = taxableExpense * corporateTaxRate;

    const totalMonthlySavings = vatSavings + incomeTaxSavings;

    return {
      vatSavings: Number(vatSavings.toFixed(2)),
      incomeTaxSavings: Number(incomeTaxSavings.toFixed(2)),
      totalMonthlySavings: Number(totalMonthlySavings.toFixed(2)),
      netMonthlyCost: Number((monthlyPayment - totalMonthlySavings).toFixed(2)),
    };
  }

  /**
   * Pronalazi sve finansijske proizvode koji su dostupni za specifičan tip imovine i profil korisnika.
   *
   * @param assetType - Tip imovine (iz tvog AssetType enuma)
   * @param profileType - Tip klijenta ('individual' ili 'business')
   * @returns Lista dostupnih proizvoda sa osnovnim uslovima
   */
  async getEligibleProducts(assetType: string) {
    const query = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.conditions', 'conditions')
      .leftJoinAndSelect('product.eligibility_rules', 'eligibility')
      .leftJoinAndSelect('product.provider', 'provider')

      .where('eligibility.asset_type = :assetType', { assetType });

    return await query.getMany();
  }

  /**
   * Dobavlja listu svih aktivnih finansijskih proizvoda.
   * Koristi 'eager loading' (relations) da bi uz primarni proizvod izvukao i
   * podatke o banci, uslovima, kamatnim stopama, porezima i pravilima podobnosti.
   *
   * @returns {Promise<FinancialProduct[]>} Niz svih aktivnih finansijskih proizvoda sa relacijama.
   */
  async findAll(): Promise<FinancialProduct[]> {
    return await this.productRepo.find({
      where: { is_active: true },
      relations: [
        'provider',
        'conditions',
        'conditions.index_rate_ref',
        'tax_rules',
        'eligibility_rules',
      ],
      order: {
        created_at: 'DESC',
      },
    });
  }

  /**
   * Dobavlja jedan specifičan finansijski proizvod na osnovu njegovog UUID-a.
   * Detaljno učitava sve povezane tabele kako bi omogućio kompletan prikaz
   * parametara lizinga i izračunavanje amortizacionog plana.
   *
   * @param {string} id - UUID finansijskog proizvoda koji se pretražuje.
   * @returns {Promise<FinancialProduct>} Objekat proizvoda sa svim relacijama.
   * @throws {NotFoundException} Ako proizvod sa prosleđenim ID-jem ne postoji u bazi.
   */
  async findOne(id: string): Promise<FinancialProduct> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: [
        'provider',
        'conditions',
        'conditions.index_rate_ref',
        'tax_rules',
        'eligibility_rules',
      ],
    });

    if (!product) {
      throw new NotFoundException(`Proizvod sa ID-jem ${id} nije pronađen.`);
    }

    return product;
  }

  /**
   * Ažurira postojeći finansijski proizvod i njegove povezane entitete.
   * Redosled ažuriranja prati zavisnosti stranih ključeva u bazi.
   *
   * @param {string} id - UUID proizvoda koji se ažurira.
   * @param {UpdateFullProductDto} dto - Objekat sa podacima za izmenu.
   * @returns {Promise<FinancialProduct>} Ažurirani podaci o proizvodu.
   */

  async updateFullProduct(
    id: string,
    dto: UpdateFullProductDto,
  ): Promise<FinancialProduct> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.findOne(FinancialProduct, {
        where: { id },
      });
      if (!product) {
        throw new NotFoundException(`Proizvod sa ID-jem ${id} nije pronađen.`);
      }

      const { providerId, conditions, eligibility, taxRules, ...mainFields } =
        dto;

      if (Object.keys(mainFields).length > 0) {
        await queryRunner.manager.update(FinancialProduct, id, mainFields);
      }

      if (conditions) {
        await queryRunner.manager.update(
          ProductCondition,
          { product_id: id },
          conditions,
        );
      }

      if (taxRules) {
        await queryRunner.manager.update(
          TaxShieldRule,
          { product_id: id },
          taxRules,
        );
      }

      if (eligibility) {
        await queryRunner.manager.delete(ProductEligibility, {
          product: { id },
        });
        const newEligibility = queryRunner.manager.create(ProductEligibility, {
          ...eligibility,
          product: { id } as any,
        });
        await queryRunner.manager.save(newEligibility);
      }

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      const errorMessage =
        err instanceof Error ? err.message : 'Nepoznata greška';
      throw new InternalServerErrorException(
        `Neuspešno ažuriranje proizvoda: ${errorMessage}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Menja status aktivnosti finansijskog proizvoda (toggle).
   * Omogućava adminu da privremeno ukloni ponudu iz kataloga bez brisanja podataka.
   *
   * @param {string} id - UUID proizvoda kojem se menja status.
   * @returns {Promise<FinancialProduct>} Proizvod sa ažuriranim is_active statusom.
   */
  async toggleActiveStatus(id: string): Promise<FinancialProduct> {
    const product = await this.productRepo.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Proizvod sa ID-jem ${id} nije pronađen.`);
    }

    product.is_active = !product.is_active;

    return await this.productRepo.save(product);
  }
}
