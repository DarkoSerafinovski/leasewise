import { Test, TestingModule } from '@nestjs/testing';
import { CreditScoreController } from './credit-score.controller';
import { CreditScoreService } from './credit-score.service';

describe('CreditScoreController', () => {
  let controller: CreditScoreController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreditScoreController],
      providers: [CreditScoreService],
    }).compile();

    controller = module.get<CreditScoreController>(CreditScoreController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
