import { Module } from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { InvestmentsController } from './investments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketInstrument } from './entities/market-instrument.entity';
import { InstrumentYield } from './entities/instrument-yield.entity';
import { MarketCorrelation } from './entities/market-correlations.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MarketInstrument,
      InstrumentYield,
      MarketCorrelation,
    ]),
  ],
  controllers: [InvestmentsController],
  providers: [InvestmentsService],
  exports: [TypeOrmModule, InvestmentsService],
})
export class InvestmentsModule {}
