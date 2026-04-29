import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { MaintenanceService } from './maintenances.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateMaintenanceTypeDto } from './dto/create-maintenance-type.dto';
import { CreateAssetMaintenanceDto } from './dto/create-asset-maintenance.dto';
import { CreateInsuranceDto } from './dto/create-insurance.dto';

@Controller('maintenances')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post('types')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async addType(@Body() dto: CreateMaintenanceTypeDto) {
    return await this.maintenanceService.addMaintenanceType(dto);
  }

  @Get('types')
  async getAllTypes() {
    return await this.maintenanceService.findAllTypes();
  }

  @Post('entry')
  @HttpCode(HttpStatus.CREATED)
  async createMaintenance(@Body() dto: CreateAssetMaintenanceDto) {
    return await this.maintenanceService.createMaintenance(dto);
  }

  @Post('insurance')
  @HttpCode(HttpStatus.CREATED)
  async createInsurance(@Body() dto: CreateInsuranceDto) {
    return await this.maintenanceService.createInsurance(dto);
  }

  @Get('profile/:assetId')
  async getFinancialProfile(@Param('assetId', ParseUUIDPipe) assetId: string) {
    return await this.maintenanceService.getAssetFinancialProfile(assetId);
  }

  @Get('tco/:assetId')
  async getTCO(
    @Param('assetId', ParseUUIDPipe) assetId: string,
    @Query(
      'years',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    years: number = 5,
  ) {
    return await this.maintenanceService.getProjectedTotalCost(assetId, years);
  }

  @Get('monthly-cost/:assetId')
  async getMonthlyCost(@Param('assetId', ParseUUIDPipe) assetId: string) {
    return await this.maintenanceService.calculateMonthlyHoldingCost(assetId);
  }
}
