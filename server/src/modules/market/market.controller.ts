import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { MarketService } from './market.service';
import { CreateMarketDepreciationDto } from './dto/create-market-depreciation.dto';
import { UpdateMarketDepreciationDto } from './dto/update-market-depreciation.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Post()
  @Roles('admin')
  @UseGuards(RolesGuard)
  create(@Body() dto: CreateMarketDepreciationDto) {
    return this.marketService.create(dto);
  }

  @Get()
  findAll() {
    return this.marketService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marketService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body() dto: UpdateMarketDepreciationDto) {
    return this.marketService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.marketService.remove(+id);
  }

  @Get('valuation/:assetId/:year')
  async getValuation(
    @Param('assetId') assetId: string,
    @Param('year') year: string,
  ) {
    const value = await this.marketService.calculateValuation(assetId, +year);
    return {
      asset_id: assetId,
      projected_year: +year,
      estimated_value: value,
    };
  }
}
