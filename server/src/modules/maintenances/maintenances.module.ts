import { Module } from '@nestjs/common';
import { MaintenanceService } from './maintenances.service';
import { MaintenancesController } from './maintenances.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Insurance } from './entities/insurance.entity';
import { AssetMaintenance } from './entities/asset-maintenance.entity';
import { MaintenanceType } from './entities/maintenance-type.entity';
import { AssetsModule } from '../assets/assets.module';
import { MarketModule } from '../market/market.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Insurance, MaintenanceType, AssetMaintenance]),
    AssetsModule,
    MarketModule,
  ],
  controllers: [MaintenancesController],
  providers: [MaintenanceService],
  exports: [TypeOrmModule, MaintenanceService],
})
export class MaintenancesModule {}
