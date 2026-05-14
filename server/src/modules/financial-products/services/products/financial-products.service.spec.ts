import { Test, TestingModule } from '@nestjs/testing';
import { FinancialProductsService } from './services/financial-products.service';

describe('FinancialProductsService', () => {
  let service: FinancialProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FinancialProductsService],
    }).compile();

    service = module.get<FinancialProductsService>(FinancialProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
