import { IsString, IsOptional, IsUrl, Length } from 'class-validator';

export class CreateProviderDto {
  @IsString()
  @Length(2, 100, { message: 'Ime banke mora imati između 2 i 100 karaktera' })
  name!: string;

  @IsOptional()
  @IsString()
  logo_url?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Website mora biti validan URL' })
  website?: string;
}

import { PartialType } from '@nestjs/mapped-types';
export class UpdateProviderDto extends PartialType(CreateProviderDto) {}
