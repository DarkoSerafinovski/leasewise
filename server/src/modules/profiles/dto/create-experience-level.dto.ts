import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateExperienceLevelDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  access_level!: number;
}
