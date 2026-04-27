import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateDocumentTypeDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Z0-9_]+$/, {
    message:
      'Code must be uppercase and can only contain letters, numbers, and underscores (e.g., ID_CARD)',
  })
  code!: string;

  @IsOptional()
  @IsBoolean()
  is_mandatory?: boolean;
}
