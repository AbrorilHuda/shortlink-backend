import { IsUrl, IsOptional, IsDateString, IsString } from 'class-validator';

export class CreateLinkDto {
  @IsUrl({}, { message: 'URL tidak valid' })
  url: string;

  @IsOptional()
  @IsString({ message: 'Title harus berupa string' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description harus berupa string' })
  description?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal tidak valid' })
  expiredAt?: string;
}
