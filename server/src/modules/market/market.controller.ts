import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { MarketService } from './market.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateMarketDepreciationDto } from './dto/create-market-depreciation.dto';
import { UpdateMarketDepreciationDto } from './dto/update-market-depreciation.dto';

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Post('categories')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() dto: CreateMarketDepreciationDto) {
    return await this.marketService.create(dto);
  }

  @Patch('categories/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMarketDepreciationDto,
  ) {
    return await this.marketService.update(id, dto);
  }

  @Delete('categories/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async removeCategory(@Param('id', ParseIntPipe) id: number) {
    return await this.marketService.remove(id);
  }

  @Get('categories')
  async findAllCategories() {
    return await this.marketService.findAll();
  }

  @Get('categories/:id')
  async findOneCategory(@Param('id', ParseIntPipe) id: number) {
    return await this.marketService.findOne(id);
  }

  @Get('valuation/:assetId')
  async getValuation(
    @Param('assetId') assetId: string,
    @Query('targetYear', ParseIntPipe) targetYear: number,
  ) {
    return await this.marketService.calculateValuation(assetId, targetYear);
  }
}
