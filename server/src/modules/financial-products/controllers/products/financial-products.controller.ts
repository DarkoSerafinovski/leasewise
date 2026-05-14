import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CalculateAnalysisDto } from '../../dto/calculate-analysis.dto';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';

import { FinancialProductsService } from '../../services/products/financial-products.service';
import {
  CreateFullProductDto,
  UpdateFullProductDto,
} from '../../dto/create-full-product.dto';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';

@Controller('financial-products')
export class FinancialProductsController {
  constructor(
    private readonly financialProductsService: FinancialProductsService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async create(@Body() dto: CreateFullProductDto) {
    return await this.financialProductsService.createFullProduct(dto);
  }

  @Get(':id/full-analysis')
  async getFullAnalysis(
    @Param('id', ParseUUIDPipe) productId: string,
    @Query() query: CalculateAnalysisDto,
    @CurrentUser('role') role: string,
  ) {
    const amortization =
      await this.financialProductsService.calculateAmortizationPlan(
        productId,
        query,
      );

    let taxAnalysis: any = null;
    if (role === 'business') {
      taxAnalysis = await this.financialProductsService.calculateTaxBenefits(
        productId,
        amortization.monthlyPayment,
      );
    }

    return {
      product_id: productId,
      calculation_date: new Date(),
      ...amortization,
      taxAnalysis,
    };
  }

  @Get()
  async findAll() {
    return await this.financialProductsService.findAll();
  }

  @Get('eligible')
  async getEligible(@Query('assetType') assetType: string) {
    return await this.financialProductsService.getEligibleProducts(assetType);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.financialProductsService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFullProductDto,
  ) {
    return await this.financialProductsService.updateFullProduct(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id', ParseUUIDPipe) id: string) {
    return await this.financialProductsService.toggleActiveStatus(id);
  }
}
