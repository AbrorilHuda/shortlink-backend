import {
  IsUrl,
  IsOptional,
  IsDateString,
  IsString,
  Matches,
} from 'class-validator';

export class CreateLinkDto {
  @IsUrl({}, { message: 'URL tidak valid' })
  url: string;

  @IsOptional()
  @IsString({ message: 'Code harus berupa string' })
  @Matches(/^[a-zA-Z0-9-_]+$/, {
    message: 'Code hanya boleh berisi huruf, angka, strip, dan underscore',
  })
  code?: string;

  @IsOptional()
  @IsString({ message: 'Title harus berupa string' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description harus berupa string' })
  description?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal tidak valid' })
  expiredAt?: string;

  @IsOptional()
  @IsString({ message: 'Password harus berupa string' })
  password?: string;
}
