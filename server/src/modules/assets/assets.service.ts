import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Feature, FeatureCategory } from './entities/features.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { Asset, AssetType } from './entities/asset.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { Vehicle } from './entities/vehicles.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { Property } from './entities/property.entity';
import { LinkFeatureDto } from './dto/link-feature.dto';
import { AssetFeature } from './entities/asset-feature-entity';
import { GetAssetsFilterDto } from './entities/get-assets-filter.dto';

@Injectable()
export class AssetsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Feature)
    private readonly featureRepo: Repository<Feature>,
    @InjectRepository(Asset)
    private readonly assetRepo: Repository<Asset>,
    @InjectRepository(AssetFeature)
    private readonly assetFeatureRepo: Repository<AssetFeature>,
  ) {}

  async createFeature(dto: CreateFeatureDto) {
    const existing = await this.featureRepo.findOne({
      where: { name: dto.name, category: dto.category },
    });

    if (existing) {
      throw new ConflictException(
        `Karakteristika '${dto.name}' već postoji u kategoriji ${dto.category}.`,
      );
    }

    const feature = this.featureRepo.create(dto);
    return await this.featureRepo.save(feature);
  }

  async findAllFeatures() {
    return await this.featureRepo.find({
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  async createVehicle(dto: CreateVehicleDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const asset = queryRunner.manager.create(Asset, {
        name: dto.name,
        base_price: dto.base_price,
        currency: dto.currency,
        market_category_id: dto.market_category_id,
        asset_type: AssetType.VEHICLE,
      });
      const savedAsset = await queryRunner.manager.save(asset);

      const vehicle = queryRunner.manager.create(Vehicle, {
        asset_id: savedAsset.id,
        make: dto.make,
        model: dto.model,
        production_year: dto.production_year,
        fuel_type: dto.fuel_type,
      });
      await queryRunner.manager.save(vehicle);

      await queryRunner.commitTransaction();

      return this.findOne(savedAsset.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async createProperty(dto: CreatePropertyDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const asset = queryRunner.manager.create(Asset, {
        name: dto.name,
        base_price: dto.base_price,
        currency: dto.currency,
        market_category_id: dto.market_category_id,
        asset_type: AssetType.PROPERTY,
      });
      const savedAsset = await queryRunner.manager.save(asset);

      const property = queryRunner.manager.create(Property, {
        asset_id: savedAsset.id,
        sq_meters: dto.sq_meters,
        location_zone: dto.location_zone,
        estimated_monthly_rent: dto.estimated_monthly_rent,
        annual_property_tax: dto.annual_property_tax,
      });
      await queryRunner.manager.save(property);

      await queryRunner.commitTransaction();

      return this.findOne(savedAsset.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: string) {
    const asset = await this.assetRepo.findOne({
      where: { id },
      relations: ['vehicle', 'property'],
    });
    if (!asset) throw new NotFoundException('Asset nije pronađen.');
    return asset;
  }

  async linkFeatureToAsset(dto: LinkFeatureDto) {
    const asset = await this.assetRepo.findOne({ where: { id: dto.asset_id } });
    const feature = await this.featureRepo.findOne({
      where: { id: dto.feature_id },
    });

    if (!asset || !feature) {
      throw new NotFoundException('Asset ili Karakteristika nisu pronađeni.');
    }

    const isVehicleMatch =
      asset.asset_type === AssetType.VEHICLE &&
      feature.category === FeatureCategory.VEHICLE_EQUIPMENT;

    const isPropertyMatch =
      asset.asset_type === AssetType.PROPERTY &&
      feature.category === FeatureCategory.PROPERTY_FEATURE;

    if (!isVehicleMatch && !isPropertyMatch) {
      throw new BadRequestException(
        'Kategorija opreme se ne poklapa sa tipom imovine.',
      );
    }

    const assetFeature = this.assetFeatureRepo.create(dto);

    await this.assetFeatureRepo.save(assetFeature);

    return {
      success: true,
      message: `Karakteristika '${feature.name}' je uspešno dodata na '${asset.name}'.`,
    };
  }

  private calculateTotalPrice(asset: Asset): number {
    const basePrice = Number(asset.base_price);
    const featuresImpact =
      asset.assetFeatures?.reduce((sum, af) => {
        return sum + Number(af.price_impact);
      }, 0) || 0;

    return basePrice + featuresImpact;
  }

  async getAssetDetails(id: string) {
    const asset = await this.assetRepo.findOne({
      where: { id },
      relations: [
        'vehicle',
        'property',
        'assetFeatures',
        'assetFeatures.feature',
      ],
    });

    if (!asset) throw new NotFoundException('Predmet nije pronađen.');

    return {
      ...asset,
      total_price: this.calculateTotalPrice(asset),
    };
  }

  async findAll(filters: GetAssetsFilterDto) {
    const query = this.assetRepo
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.vehicle', 'vehicle')
      .leftJoinAndSelect('asset.property', 'property')
      .leftJoinAndSelect('asset.assetFeatures', 'af');

    if (filters.type) {
      query.andWhere('asset.asset_type = :type', { type: filters.type });
    }

    if (filters.minPrice) {
      query.andWhere('asset.base_price >= :minPrice', {
        minPrice: filters.minPrice,
      });
    }

    if (filters.maxPrice) {
      query.andWhere('asset.base_price <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
    }

    if (filters.currency) {
      query.andWhere('asset.currency = :currency', {
        currency: filters.currency,
      });
    }

    if (filters.make) {
      query.andWhere('vehicle.make ILIKE :make', { make: `%${filters.make}%` });
    }

    if (filters.model) {
      query.andWhere('vehicle.model ILIKE :model', {
        model: `%${filters.model}%`,
      });
    }

    if (filters.minYear) {
      query.andWhere('vehicle.production_year >= :minYear', {
        minYear: filters.minYear,
      });
    }

    if (filters.maxYear) {
      query.andWhere('vehicle.production_year <= :maxYear', {
        maxYear: filters.maxYear,
      });
    }

    if (filters.fuelTypes && filters.fuelTypes.length > 0) {
      query.andWhere('vehicle.fuel_type IN (:...fuels)', {
        fuels: filters.fuelTypes,
      });
    }

    if (filters.minSqMeters) {
      query.andWhere('property.sq_meters >= :minSq', {
        minSq: filters.minSqMeters,
      });
    }

    if (filters.maxSqMeters) {
      query.andWhere('property.sq_meters <= :maxSq', {
        maxSq: filters.maxSqMeters,
      });
    }

    if (filters.locationZone) {
      query.andWhere('property.location_zone = :zone', {
        zone: filters.locationZone,
      });
    }

    if (filters.minRent) {
      query.andWhere('property.estimated_monthly_rent >= :minRent', {
        minRent: filters.minRent,
      });
    }

    const limit = filters.per_page || 10;
    const page = filters.page || 1;
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const order = filters.sortOrder || 'DESC';

    if (filters.sortBy) {
      const sortBy = filters.sortBy;

      if (['make', 'model', 'production_year'].includes(sortBy)) {
        query.orderBy(`vehicle.${sortBy}`, order);
      } else if (['sq_meters', 'location_zone'].includes(sortBy)) {
        query.orderBy(`property.${sortBy}`, order);
      } else {
        query.orderBy(`asset.${sortBy}`, order);
      }
    } else {
      query.orderBy('asset.created_at', order);
    }

    const [data, total] = await query.getManyAndCount();

    const dataWithTotals = data.map((asset) => ({
      ...asset,
      total_price: this.calculateTotalPrice(asset),
    }));

    return {
      data: dataWithTotals,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
}
