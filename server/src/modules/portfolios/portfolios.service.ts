import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not } from 'typeorm';
import { InvestmentPortfolio } from './entities/investment-portfolio.entity';
import { PortfolioComposition } from './entities/portfolio-composition.entity';
import { SelfFundingProgram } from './entities/self-funding-program.entity';
import { CreateInvestmentPortfolioDto } from './dto/create-investment-portfolio.dto';

@Injectable()
export class PortfoliosService {
  constructor(
    @InjectRepository(InvestmentPortfolio)
    private readonly portfolioRepo: Repository<InvestmentPortfolio>,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, dto: CreateInvestmentPortfolioDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const totalAllocation = dto.compositions.reduce(
        (sum, item) => sum + Number(item.allocation_pct),
        0,
      );

      if (Math.abs(totalAllocation - 100) > 0.01) {
        throw new BadRequestException(
          `Ukupna alokacija mora biti 100%. Trenutno je: ${totalAllocation}%`,
        );
      }

      const portfolio = queryRunner.manager.create(InvestmentPortfolio, {
        name: dto.name,
        risk_level: dto.risk_level,
        is_active: dto.is_active || false,
        user_id: userId,
      });
      const savedPortfolio = await queryRunner.manager.save(portfolio);

      const compositionEntities = dto.compositions.map((comp) =>
        queryRunner.manager.create(PortfolioComposition, {
          portfolio_id: savedPortfolio.id,
          instrument_id: comp.instrument_id,
          allocation_pct: comp.allocation_pct,
        }),
      );
      await queryRunner.manager.save(compositionEntities);

      const fundingProgram = queryRunner.manager.create(SelfFundingProgram, {
        portfolio_id: savedPortfolio.id,
        safety_buffer_months: dto.funding_program.safety_buffer_months,
        cash_reserve_amount: dto.funding_program.initial_cash_reserve || 0,
        next_rebalance_date: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        ),
      });
      await queryRunner.manager.save(fundingProgram);

      if (savedPortfolio.is_active) {
        await queryRunner.manager.update(
          InvestmentPortfolio,
          { user_id: userId, id: Not(savedPortfolio.id) },
          { is_active: false },
        );
      }

      await queryRunner.commitTransaction();

      return this.findOne(savedPortfolio.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: string) {
    return await this.portfolioRepo.findOne({
      where: { id },
      relations: [
        'compositions',
        'compositions.instrument',
        'self_funding_program',
      ],
    });
  }

  async findAll(userId: string) {
    return await this.portfolioRepo.find({
      where: { user_id: userId },
      relations: ['compositions', 'self_funding_program'],
      order: { is_active: 'DESC', name: 'ASC' },
    });
  }

  async remove(id: string, userId: string) {
    const portfolio = await this.portfolioRepo.findOne({
      where: { id, user_id: userId },
    });
    if (!portfolio) throw new NotFoundException('Portfolio nije pronađen');

    await this.portfolioRepo.remove(portfolio);
    return { message: 'Portfolio uspešno obrisan' };
  }

  async update(
    id: string,
    userId: string,
    dto: Partial<CreateInvestmentPortfolioDto>,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const portfolio = await queryRunner.manager.findOne(InvestmentPortfolio, {
        where: { id, user_id: userId },
        relations: ['compositions', 'self_funding_program'],
      });

      if (!portfolio) throw new NotFoundException('Portfolio nije pronađen');

      if (dto.compositions) {
        const totalPct = dto.compositions.reduce(
          (s, i) => s + Number(i.allocation_pct),
          0,
        );
        if (Math.abs(totalPct - 100) > 0.01) {
          throw new BadRequestException('Suma alokacija mora biti 100%');
        }

        await queryRunner.manager.delete(PortfolioComposition, {
          portfolio_id: id,
        });

        const newCompositions = dto.compositions.map((c) =>
          queryRunner.manager.create(PortfolioComposition, {
            ...c,
            portfolio_id: id,
          }),
        );
        await queryRunner.manager.save(newCompositions);
      }

      if (dto.name) portfolio.name = dto.name;
      if (dto.risk_level) portfolio.risk_level = dto.risk_level;

      if (dto.funding_program && portfolio.self_funding_program) {
        Object.assign(portfolio.self_funding_program, dto.funding_program);
        await queryRunner.manager.save(portfolio.self_funding_program);
      }

      await queryRunner.manager.save(portfolio);
      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async toggleActive(id: string, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const portfolio = await queryRunner.manager.findOne(InvestmentPortfolio, {
        where: { id, user_id: userId },
      });

      if (!portfolio) throw new NotFoundException('Portfolio nije pronađen');

      await queryRunner.manager.update(
        InvestmentPortfolio,
        { user_id: userId },
        { is_active: false },
      );

      portfolio.is_active = true;
      await queryRunner.manager.save(portfolio);

      await queryRunner.commitTransaction();
      return {
        message: `Portfolio "${portfolio.name}" je sada aktivan`,
        id: portfolio.id,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
