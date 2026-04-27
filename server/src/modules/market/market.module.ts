import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketDepreciation } from './entities/market-depreciation.entity';
import { AssetsModule } from '../assets/assets.module';

@Module({
  imports: [TypeOrmModule.forFeature([MarketDepreciation]), AssetsModule],
  controllers: [MarketController],
  providers: [MarketService],
  exports: [MarketService, TypeOrmModule],
})
export class MarketModule {}
