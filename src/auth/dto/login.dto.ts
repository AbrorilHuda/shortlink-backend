import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @IsString()
  password: string;

  @IsNotEmpty({ message: 'Validasi keamanan (Turnstile) diperlukan' })
  @IsString()
  cfTurnstileResponse: string;
}
