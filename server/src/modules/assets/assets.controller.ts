import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { LinkFeatureDto } from './dto/link-feature.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { CreatePropertyDto } from './dto/create-property.dto';
import { GetAssetsFilterDto } from './entities/get-assets-filter.dto';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('features')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async createFeature(@Body() dto: CreateFeatureDto) {
    return this.assetsService.createFeature(dto);
  }

  @Get('features')
  async getAllFeatures() {
    return this.assetsService.findAllFeatures();
  }

  @Post('vehicles')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async createVehicle(@Body() dto: CreateVehicleDto) {
    return this.assetsService.createVehicle(dto);
  }

  @Post('properties')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async createProperty(@Body() dto: CreatePropertyDto) {
    return this.assetsService.createProperty(dto);
  }

  @Post('link-feature')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async linkFeature(@Body() dto: LinkFeatureDto) {
    return this.assetsService.linkFeatureToAsset(dto);
  }

  @Get(':id')
  async getDetails(@Param('id', ParseUUIDPipe) id: string) {
    return this.assetsService.getAssetDetails(id);
  }

  @Get('assets')
  async getAllAssets(@Body() dto: GetAssetsFilterDto) {
    return this.assetsService.findAll(dto);
  }
}
