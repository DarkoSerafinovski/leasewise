import { Module } from '@nestjs/common';
import { InvestmentProfilesService } from './profiles.service';
import { InvestmentProfilesController } from './profiles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestmentProfile } from './entities/investment-profile.entity';
import { RiskTolerance } from './entities/risk-tolerances.entity';
import { ExperienceLevel } from './entities/experience-levels.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InvestmentProfile,
      RiskTolerance,
      ExperienceLevel,
    ]),
  ],
  controllers: [InvestmentProfilesController],
  providers: [InvestmentProfilesService],
  exports: [InvestmentProfilesService, TypeOrmModule],
})
export class ProfilesModule {}
