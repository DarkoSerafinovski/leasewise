import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMaintenanceTypeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;
}
