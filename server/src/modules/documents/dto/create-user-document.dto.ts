import { IsNotEmpty, IsNumber, IsString, IsUrl } from 'class-validator';

export class CreateUserDocumentDto {
  @IsNotEmpty({ message: 'Morate izabrati tip dokumenta' })
  @IsNumber()
  doc_type_id!: number;

  @IsNotEmpty({ message: 'Putanja do fajla je obavezna' })
  @IsString()
  // @IsUrl({}, { message: 'file_url mora biti ispravan link' })
  // Opciono: IsUrl ako odmah ides na cloud storage, IsString ako je lokalno
  file_url!: string;
}
