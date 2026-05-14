import { Module } from '@nestjs/common';
import { FinancialProductsController } from './controllers/products/financial-products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialProduct } from './entities/financial-product.entity';
import { ProductCondition } from './entities/product-condition.entity';
import { TaxShieldRule } from './entities/tax-shield-rule.entity';
import { IndexRate } from './entities/index-rate.entity';
import { ProductEligibility } from './entities/product-eligibility.entity';
import { Provider } from './entities/provider.entity';
import { ProvidersService } from './services/providers/providers.service';
import { ProvidersController } from './controllers/providers/providers.controller';
import { FinancialProductsService } from './services/products/financial-products.service';
import { IndexRatesService } from './services/index-rates/index-rates.service';
import { IndexRatesController } from './controllers/index-rates/index-rates.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FinancialProduct,
      ProductCondition,
      TaxShieldRule,
      IndexRate,
      ProductEligibility,
      Provider,
    ]),
  ],
  controllers: [
    FinancialProductsController,
    ProvidersController,
    IndexRatesController,
  ],
  providers: [FinancialProductsService, ProvidersService, IndexRatesService],
  exports: [TypeOrmModule, FinancialProductsService],
})
export class FinancialProductsModule {}
