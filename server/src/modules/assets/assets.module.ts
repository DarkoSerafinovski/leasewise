import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity';
import { Property } from './entities/property.entity';
import { Vehicle } from './entities/vehicles.entity';
import { Feature } from './entities/features.entity';
import { AssetFeature } from './entities/asset-feature-entity';
import { MarketModule } from '../market/market.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset, Property, Vehicle, Feature, AssetFeature]),
    MarketModule,
  ],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService, TypeOrmModule],
})
export class AssetsModule {}
