import { Test, TestingModule } from '@nestjs/testing';
import { FinancialProductsController } from './financial-products.controller';
import { FinancialProductsService } from './services/financial-products.service';

describe('FinancialProductsController', () => {
  let controller: FinancialProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinancialProductsController],
      providers: [FinancialProductsService],
    }).compile();

    controller = module.get<FinancialProductsController>(
      FinancialProductsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
