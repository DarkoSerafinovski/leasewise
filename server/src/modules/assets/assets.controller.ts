import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { CreatePropertyDto } from './dto/create-property.dto';
import { LinkFeatureDto } from './dto/link-feature.dto';
import { GetAssetsFilterDto } from './entities/get-assets-filter.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('features')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async createFeature(@Body() dto: CreateFeatureDto) {
    return await this.assetsService.createFeature(dto);
  }

  @Get('features')
  async getAllFeatures() {
    return await this.assetsService.findAllFeatures();
  }

  @Post('vehicles')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async createVehicle(@Body() dto: CreateVehicleDto) {
    return await this.assetsService.createVehicle(dto);
  }

  @Post('properties')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async createProperty(@Body() dto: CreatePropertyDto) {
    return await this.assetsService.createProperty(dto);
  }

  @Post('link-feature')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async linkFeature(@Body() dto: LinkFeatureDto) {
    return await this.assetsService.linkFeatureToAsset(dto);
  }

  @Get()
  async findAll(@Query() filters: GetAssetsFilterDto) {
    return await this.assetsService.findAll(filters);
  }

  @Get(':id/details')
  async getDetails(@Param('id', ParseUUIDPipe) id: string) {
    return await this.assetsService.getAssetDetails(id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.assetsService.findOne(id);
  }
}
