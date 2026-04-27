import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { InvestmentProfilesService } from './profiles.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpsertInvestmentProfileDto } from './dto/upsert-investment-profile.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateRiskToleranceDto } from './dto/create-risk-tolerance.dto';
import { CreateExperienceLevelDto } from './dto/create-experience-level.dto';

@Controller('investment-profiles')
export class InvestmentProfilesController {
  constructor(private readonly service: InvestmentProfilesService) {}

  @Post('risks')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async addRisk(@Body() dto: CreateRiskToleranceDto) {
    return this.service.createRiskTolerance(dto);
  }

  @Post('experiences')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async addExperience(@Body() dto: CreateExperienceLevelDto) {
    return this.service.createExperienceLevel(dto);
  }

  @Get('options')
  async getOptions() {
    return this.service.getOptions();
  }

  @Post()
  async saveProfile(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpsertInvestmentProfileDto,
  ) {
    return this.service.upsertProfile(userId, dto);
  }

  @Get('my')
  async getMyProfile(@CurrentUser('userId') userId: string) {
    return this.service.getMyProfile(userId);
  }
}
