import {
  IsOptional,
  IsEnum,
  IsString,
  IsBoolean,
  IsNumber,
  IsIn,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { UserRole } from '../entities/user.entity';

export class GetUsersFilterDto {
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsEnum(UserRole) role?: UserRole;
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @IsOptional() @IsString() first_name?: string;
  @IsOptional() @IsString() last_name?: string;
  @IsOptional() @IsString() employment_status?: string;
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  is_permanently_employed?: boolean;
  @IsOptional() @IsNumber() @Type(() => Number) min_monthly_income?: number;
  @IsOptional() @IsNumber() @Type(() => Number) max_monthly_income?: number;

  @IsOptional() @IsString() company_name?: string;
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  is_tax_payer?: boolean;
  @IsOptional() @IsNumber() @Type(() => Number) min_annual_revenue?: number;
  @IsOptional() @IsNumber() @Type(() => Number) max_annual_revenue?: number;
  @IsOptional() @IsNumber() @Type(() => Number) min_ebitda?: number;

  @IsOptional()
  @IsString()
  sortBy?: string = 'created_at';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsNumber() per_page?: number = 10;
}
