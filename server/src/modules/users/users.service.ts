import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { DataSource, DeepPartial, Repository } from 'typeorm';
import { IndividualProfile } from './entities/individual-profile.entity';
import { BusinessProfile } from './entities/business-profile.entity';
import * as bcrypt from 'bcrypt';
import { GetUsersFilterDto } from './dto/get-users-filter.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(IndividualProfile)
    private individualRepo: Repository<IndividualProfile>,
    @InjectRepository(BusinessProfile)
    private businessRepo: Repository<BusinessProfile>,

    private dataSource: DataSource,
  ) {}

  /**
   * Kreira profil za fizičko lice (Individual) koristeći bazu podataka i transakciju.
   * Proces uključuje generisanje salt-a, hash-ovanje lozinke, kreiranje osnovnog User naloga,
   * a potom i kreiranje povezanog individualnog profila.
   * @param userData Osnovni podaci o korisniku (email, password, role)
   * @param profileData Lični podaci (ime, prezime, prihodi, zaposlenje)
   * @returns Podaci o korisniku bez lozinke (password_hash je uklonjen iz odgovora)
   */
  async createIndividualProfile(
    userData: DeepPartial<User>,
    profileData: DeepPartial<IndividualProfile>,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(userData.password_hash!, salt);

      const user = this.userRepo.create({
        ...userData,
        password_hash: hashedPassword,
      });
      const savedUser = await queryRunner.manager.save<User>(user);

      const { password_hash, ...userWithoutPassword } = savedUser;

      const profile = this.individualRepo.create({
        ...profileData,
        user_id: savedUser.id,
      });
      await queryRunner.manager.save(profile);

      await queryRunner.commitTransaction();
      return userWithoutPassword;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Kreira profil za pravno lice (Business) kroz atomičnu transakciju.
   * Slično kao kod fizičkih lica, ali kreira BusinessProfile sa podacima o kompaniji.
   * @param userData Osnovni podaci o nalogu
   * @param profileData Poslovni podaci (naziv firme, PIB, prihodi, EBITDA)
   * @returns Podaci o kreiranom korisniku bez lozinke
   */
  async createBusinessProfile(
    userData: DeepPartial<User>,
    profileData: DeepPartial<BusinessProfile>,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(userData.password_hash!, salt);

      const user = this.userRepo.create({
        ...userData,
        password_hash: hashedPassword,
      });
      const savedUser = await queryRunner.manager.save<User>(user);

      const { password_hash, ...userWithoutPassword } = savedUser;

      const profile = this.businessRepo.create({
        ...profileData,
        user_id: savedUser.id,
      });
      await queryRunner.manager.save(profile);

      await queryRunner.commitTransaction();
      return userWithoutPassword;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Pronalazi korisnika isključivo na osnovu email-a.
   * Koristi se primarno u AuthService-u za proces logovanja.
   * Eksplicitno selektuje password_hash koji je inače sakriven u entitetu.
   * @param email Jedinstvena email adresa korisnika
   * @returns User entitet ili null ako korisnik ne postoji
   */
  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepo
      .createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.password_hash', 'user.role'])
      .where('user.email = :email', { email })
      .getOne();
  }

  /**
   * Dobavlja kompletan profil korisnika na osnovu njegovog ID-a.
   * Dinamički određuje koju relaciju (individualnu ili poslovnu) treba učitati na osnovu uloge.
   * @param id UUID korisnika
   * @returns Korisnik sa učitanim specifičnim profilom
   * @throws NotFoundException ako ID ne postoji u bazi
   */
  async getUserById(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Korisnik sa id-em ${id} nije pronadjen`);
    }

    const profileRelation =
      user.role === UserRole.BUSINESS ? 'businessProfile' : 'individualProfile';

    const profile = await this.userRepo.findOne({
      where: { id },
      relations: [profileRelation],
    });

    return profile;
  }

  /**
   * Napredni sistem za filtriranje korisnika i njihovih profila.
   * Omogućava pretragu po email-u, roli, ali i po specifičnim poljima iz profila
   * (npr. opseg prihoda za fizička lica ili EBITDA za pravna lica).
   * @param filters DTO sa kriterijumima za pretragu, sortiranje i paginaciju
   * @returns Paginisana lista korisnika sa uključenim podacima iz profila
   */
  async findAll(filters: GetUsersFilterDto) {
    const query = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.individualProfile', 'ind')
      .leftJoinAndSelect('user.businessProfile', 'biz');

    if (filters.email)
      query.andWhere('user.email ILIKE :email', {
        email: `%${filters.email}%`,
      });

    if (filters.role)
      query.andWhere('user.role = :role', { role: filters.role });

    if (filters.isActive !== undefined)
      query.andWhere('user.isActive = :isActive', {
        isActive: filters.isActive,
      });

    if (filters.first_name)
      query.andWhere('ind.first_name ILIKE :fn', {
        fn: `%${filters.first_name}%`,
      });

    if (filters.last_name)
      query.andWhere('ind.last_name ILIKE :ln', {
        ln: `%${filters.last_name}%`,
      });

    if (filters.employment_status)
      query.andWhere('ind.employment_status = :status', {
        status: filters.employment_status,
      });

    if (filters.is_permanently_employed !== undefined)
      query.andWhere('ind.is_permanently_employed = :status', {
        status: filters.is_permanently_employed,
      });

    if (filters.min_monthly_income)
      query.andWhere('ind.monthly_net_income >= :minInc', {
        minInc: filters.min_monthly_income,
      });

    if (filters.max_monthly_income)
      query.andWhere('ind.monthly_net_income <= :maxInc', {
        maxInc: filters.max_monthly_income,
      });

    if (filters.company_name)
      query.andWhere('biz.company_name ILIKE :cn', {
        cn: `%${filters.company_name}%`,
      });

    if (filters.is_tax_payer !== undefined)
      query.andWhere('biz.is_tax_payer = :payer', {
        payer: filters.is_tax_payer,
      });

    if (filters.min_annual_revenue)
      query.andWhere('biz.annual_revenue >= :minRev', {
        minRev: filters.min_annual_revenue,
      });

    if (filters.max_annual_revenue)
      query.andWhere('biz.annual_revenue <= :maxRev', {
        maxRev: filters.max_annual_revenue,
      });

    if (filters.min_ebitda)
      query.andWhere('biz.ebitda >= :minEbi', {
        minEbi: filters.min_ebitda,
      });

    const limit = filters.per_page || 10;
    const page = filters.page || 1;
    const skip = (page - 1) * limit;

    query.skip(skip).take(limit);

    const order = filters.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    if (
      filters.sortBy === 'monthly_net_income' ||
      filters.sortBy === 'first_name' ||
      filters.sortBy === 'last_name'
    ) {
      query.orderBy(`ind.${filters.sortBy}`, order);
    } else if (
      filters.sortBy === 'annual_revenue' ||
      filters.sortBy === 'company_name' ||
      filters.sortBy === 'ebitda'
    ) {
      query.orderBy(`biz.${filters.sortBy}`, order);
    } else {
      const sortField = filters.sortBy
        ? `user.${filters.sortBy}`
        : 'user.created_at';

      query.orderBy(sortField, order);
    }

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Menja status aktivnosti korisnika (Toggle).
   * Ako je korisnik bio aktivan, biće deaktiviran i obrnuto.
   * @param id UUID korisnika
   * @returns Objekat sa novim stanjem i porukom uspeha
   * @throws NotFoundException ako korisnik ne postoji
   */
  async toggleStatus(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Korisnik sa ID-em ${id} nije pronađen`);
    }

    user.isActive = !user.isActive;
    await this.userRepo.save(user);

    return {
      success: true,
      message: `Korisnik je uspešno ${user.isActive ? 'aktiviran' : 'deaktiviran'}`,
      currentStatus: user.isActive,
    };
  }
}
