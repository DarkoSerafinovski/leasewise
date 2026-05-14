import { Test, TestingModule } from '@nestjs/testing';
import { IndexRatesController } from './index-rates.controller';

describe('IndexRatesController', () => {
  let controller: IndexRatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IndexRatesController],
    }).compile();

    controller = module.get<IndexRatesController>(IndexRatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
