import { IsString, IsNumber, IsNotEmpty, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateIndexRateDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(-10)
  @Max(50)
  current_value!: number;
}

export class UpdateIndexRateDto extends PartialType(CreateIndexRateDto) {}
