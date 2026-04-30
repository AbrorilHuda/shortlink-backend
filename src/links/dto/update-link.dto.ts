import {
  IsUrl,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsString,
} from 'class-validator';

export class UpdateLinkDto {
  @IsOptional()
  @IsUrl({}, { message: 'URL tidak valid' })
  originalUrl?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive harus berupa boolean' })
  isActive?: boolean;

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
