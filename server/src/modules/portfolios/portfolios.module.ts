import { Module } from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import { PortfoliosController } from './portfolios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestmentPortfolio } from './entities/investment-portfolio.entity';
import { PortfolioComposition } from './entities/portfolio-composition.entity';
import { SelfFundingProgram } from './entities/self-funding-program.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InvestmentPortfolio,
      PortfolioComposition,
      SelfFundingProgram,
    ]),
  ],
  controllers: [PortfoliosController],
  providers: [PortfoliosService],
  exports: [TypeOrmModule, PortfoliosService],
})
export class PortfoliosModule {}
