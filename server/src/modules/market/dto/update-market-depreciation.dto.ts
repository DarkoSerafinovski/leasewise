import { PartialType } from '@nestjs/mapped-types';
import { CreateMarketDepreciationDto } from './create-market-depreciation.dto';

export class UpdateMarketDepreciationDto extends PartialType(
  CreateMarketDepreciationDto,
) {}
