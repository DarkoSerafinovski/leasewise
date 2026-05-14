import { Test, TestingModule } from '@nestjs/testing';
import { IndexRatesService } from './index-rates.service';

describe('IndexRatesService', () => {
  let service: IndexRatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IndexRatesService],
    }).compile();

    service = module.get<IndexRatesService>(IndexRatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
