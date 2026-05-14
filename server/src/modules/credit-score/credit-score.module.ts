import { Module } from '@nestjs/common';
import { CreditScoreService } from './credit-score.service';
import { CreditScoreController } from './credit-score.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditScoreCategory } from './entities/credit-score-category.entity';
import { CreditSnapshot } from './entities/credit-snapshot.entity';
import { UsersModule } from '../users/users.module';
import { FinancialProductsModule } from '../financial-products/financial-products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CreditScoreCategory, CreditSnapshot]),
    UsersModule,
    FinancialProductsModule,
  ],
  controllers: [CreditScoreController],
  providers: [CreditScoreService],
  exports: [CreditScoreService, TypeOrmModule],
})
export class CreditScoreModule {}
