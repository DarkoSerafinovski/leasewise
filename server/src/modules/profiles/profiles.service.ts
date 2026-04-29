import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvestmentProfile } from './entities/investment-profile.entity';
import { Repository } from 'typeorm';
import { UpsertInvestmentProfileDto } from './dto/upsert-investment-profile.dto';
import { RiskTolerance } from './entities/risk-tolerances.entity';
import { ExperienceLevel } from './entities/experience-levels.entity';
import { CreateRiskToleranceDto } from './dto/create-risk-tolerance.dto';
import { CreateExperienceLevelDto } from './dto/create-experience-level.dto';

@Injectable()
export class InvestmentProfilesService {
  constructor(
    @InjectRepository(InvestmentProfile)
    private readonly profileRepo: Repository<InvestmentProfile>,
    @InjectRepository(RiskTolerance)
    private readonly riskRepo: Repository<RiskTolerance>,
    @InjectRepository(ExperienceLevel)
    private readonly expRepo: Repository<ExperienceLevel>,
  ) {}

  /**
   * Kreira novi nivo tolerancije na rizik u šifarniku (npr. 'Konzervativan', 'Agresivan').
   * @param dto Podaci o nazivu rizika i opisu
   * @returns Snimljen RiskTolerance entitet
   */
  async createRiskTolerance(dto: CreateRiskToleranceDto) {
    const rt = this.riskRepo.create(dto);
    return await this.riskRepo.save(rt);
  }

  /**
   * Dodaje novi nivo iskustva u šifarniku (npr. 'Početnik', 'Ekspert').
   * @param dto Podaci o nazivu nivoa iskustva
   * @returns Snimljen ExperienceLevel entitet
   */
  async createExperienceLevel(dto: CreateExperienceLevelDto) {
    const el = this.expRepo.create(dto);
    return await this.expRepo.save(el);
  }

  /**
   * Dobavlja sve dostupne opcije za rizik i iskustvo.
   * Koristi Promise.all za paralelno izvršavanje upita radi boljih performansi.
   * @returns Objekat sa nizovima rizika i nivoa iskustva za frontend selektore
   */
  async getOptions() {
    const [risks, experiences] = await Promise.all([
      this.riskRepo.find(),
      this.expRepo.find(),
    ]);
    return { risks, experiences };
  }

  /**
   * Kreira ili ažurira (upsert) investicioni profil korisnika.
   * Ako profil postoji, ažurira ga i osvežava datum poslednjeg testiranja.
   * Ako ne postoji, kreira novi profil vezan za korisnika.
   * @param userId UUID ulogovanog korisnika
   * @param dto Podaci o odabranom riziku, iskustvu i investicionim ciljevima
   * @returns Rezultat operacije sa sačuvanim profilom
   * @throws NotFoundException ako prosleđeni ID-jevi rizika ili iskustva nisu validni
   */
  async upsertProfile(userId: string, dto: UpsertInvestmentProfileDto) {
    const [risk, exp] = await Promise.all([
      this.riskRepo.findOne({ where: { id: dto.risk_tolerance_id } }),
      this.expRepo.findOne({ where: { id: dto.experience_level_id } }),
    ]);

    if (!risk || !exp) {
      throw new NotFoundException(
        'Odabrani nivo rizika ili iskustva ne postoji.',
      );
    }

    let profile = await this.profileRepo.findOne({
      where: { user_id: userId },
    });

    if (profile) {
      Object.assign(profile, dto);
      profile.last_test_date = new Date();
    } else {
      profile = this.profileRepo.create({
        ...dto,
        user_id: userId,
      });
    }

    await this.profileRepo.save(profile);
    return {
      success: true,
      message: 'Investicioni profil je uspešno sačuvan.',
      data: profile,
    };
  }

  /**
   * Dobavlja investicioni profil ulogovanog korisnika sa detaljima o riziku i iskustvu.
   * @param userId UUID korisnika
   * @returns InvestmentProfile sa učitanim relacijama
   * @throws NotFoundException ako korisnik još uvek nije popunio profil
   */
  async getMyProfile(userId: string) {
    const profile = await this.profileRepo.findOne({
      where: { user_id: userId },
      relations: ['risk_tolerance', 'experience_level'],
    });
    if (!profile) throw new NotFoundException('Profil nije popunjen.');
    return profile;
  }
}
