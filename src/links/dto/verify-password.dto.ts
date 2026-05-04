import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyPasswordDto {
  @IsString({ message: 'Password harus berupa string' })
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  password: string;
}
