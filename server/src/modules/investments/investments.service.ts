import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { MarketInstrument } from './entities/market-instrument.entity';
import { InstrumentYield } from './entities/instrument-yield.entity';
import { CreateFullInstrumentDto } from './dto/create-full-instrument.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MarketCorrelation } from './entities/market-correlations.entity';
import { CreateCorrelationDto } from './dto/create-correlation.dto';

@Injectable()
export class InvestmentsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(MarketInstrument)
    private readonly instrumentRepo: Repository<MarketInstrument>,
    @InjectRepository(MarketCorrelation)
    private readonly correlationRepo: Repository<MarketCorrelation>,
  ) {}

  async createFullInstrument(dto: CreateFullInstrumentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager.findOne(MarketInstrument, {
        where: { ticker: dto.ticker },
      });
      if (existing)
        throw new BadRequestException('Instrument sa tim tickerom već postoji');

      const instrument = queryRunner.manager.create(MarketInstrument, {
        ticker: dto.ticker,
        name: dto.name,
        asset_class: dto.asset_class,
        expense_ratio_pct: dto.expense_ratio_pct,
      });
      const savedInstrument = await queryRunner.manager.save(instrument);

      const yields = queryRunner.manager.create(InstrumentYield, {
        instrument_id: savedInstrument.id,
        avg_yield_5y: dto.avg_yield_5y,
        avg_yield_10y: dto.avg_yield_10y,
        avg_yield_20y: dto.avg_yield_20y,
        standard_deviation: dto.standard_deviation,
        worst_year_drawdown: dto.worst_year_drawdown,
      });
      await queryRunner.manager.save(yields);

      await queryRunner.commitTransaction();

      return savedInstrument;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllInstruments() {
    return await this.instrumentRepo.find({
      relations: ['yields'],
      order: {
        ticker: 'ASC',
      },
    });
  }

  async getInstrumentDetails(id: string) {
    const instrument = await this.instrumentRepo.findOne({
      where: { id },
      relations: ['yields'],
    });

    if (!instrument) {
      throw new NotFoundException(`Instrument sa ID-em ${id} nije pronađen`);
    }

    return instrument;
  }

  async getInstrumentByTicker(ticker: string) {
    const instrument = await this.instrumentRepo.findOne({
      where: { ticker },
      relations: ['yields'],
    });

    if (!instrument) {
      throw new NotFoundException(`Instrument ${ticker} nije pronađen`);
    }

    return instrument;
  }

  async updateInstrument(id: string, dto: Partial<CreateFullInstrumentDto>) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const instrument = await queryRunner.manager.findOne(MarketInstrument, {
        where: { id },
        relations: ['yields'],
      });

      if (!instrument) throw new NotFoundException('Instrument nije pronađen');

      const {
        avg_yield_5y,
        avg_yield_10y,
        avg_yield_20y,
        standard_deviation,
        worst_year_drawdown,
        ...instrumentData
      } = dto;

      const yieldUpdate = JSON.parse(
        JSON.stringify({
          avg_yield_5y,
          avg_yield_10y,
          avg_yield_20y,
          standard_deviation,
          worst_year_drawdown,
        }),
      );

      Object.assign(instrument, instrumentData);

      if (instrument.yields && Object.keys(yieldUpdate).length > 0) {
        Object.assign(instrument.yields, yieldUpdate);
        instrument.yields.last_updated = new Date();
      }

      await queryRunner.manager.save(instrument);

      await queryRunner.commitTransaction();
      return instrument;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteInstrument(id: string) {
    const result = await this.instrumentRepo.delete(id); // Direktno brisanje po ID-u

    if (result.affected === 0) {
      throw new NotFoundException('Instrument nije pronađen');
    }

    return {
      message: `Instrument je uspešno obrisan sa svim povezanim podacima.`,
    };
  }

  async createCorrelation(dto: CreateCorrelationDto) {
    if (dto.instrument_a_id === dto.instrument_b_id) {
      throw new BadRequestException(
        'Ne možete kreirati korelaciju instrumenta sa samim sobom',
      );
    }

    const existing = await this.correlationRepo.findOne({
      where: [
        {
          instrument_a_id: dto.instrument_a_id,
          instrument_b_id: dto.instrument_b_id,
        },
        {
          instrument_a_id: dto.instrument_b_id,
          instrument_b_id: dto.instrument_a_id,
        },
      ],
    });

    if (existing) {
      throw new BadRequestException(
        'Korelacija između ova dva instrumenta već postoji. Koristite Update.',
      );
    }

    const correlation = this.correlationRepo.create(dto);
    return await this.correlationRepo.save(correlation);
  }

  async findAllCorrelations() {
    return await this.correlationRepo.find({
      relations: ['instrument_a', 'instrument_b'],
      select: {
        instrument_a: { ticker: true, name: true },
        instrument_b: { ticker: true, name: true },
      },
    });
  }

  async updateCorrelation(id: string, coefficient: number) {
    const correlation = await this.correlationRepo.findOne({ where: { id } });
    if (!correlation) throw new NotFoundException('Korelacija nije pronađena');

    correlation.correlation_coefficient = coefficient;
    return await this.correlationRepo.save(correlation);
  }

  async deleteCorrelation(id: string) {
    const result = await this.correlationRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('Korelacija nije pronađena');
    return { message: 'Korelacija obrisana' };
  }
}
