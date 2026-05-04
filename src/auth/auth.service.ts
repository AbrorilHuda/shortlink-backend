import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

type TurnstileVerifyResponse = {
  success: boolean;
};

function isTurnstileVerifyResponse(
  value: unknown,
): value is TurnstileVerifyResponse {
  return (
    !!value &&
    typeof value === 'object' &&
    'success' in value &&
    typeof (value as Record<string, unknown>).success === 'boolean'
  );
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private async verifyTurnstile(token: string) {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      // Jika secret key tidak di-set, anggap pass untuk development, tapi idealnya throw error jika di prod
      return;
    }

    const formData = new FormData();
    formData.append('secret', secret);
    formData.append('response', token);

    try {
      const result = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          body: formData,
          method: 'POST',
        },
      );

      const outcome: unknown = await result.json();
      if (!isTurnstileVerifyResponse(outcome) || !outcome.success) {
        throw new UnauthorizedException('Validasi keamanan Turnstile gagal');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Gagal memverifikasi token keamanan');
    }
  }

  async register(dto: RegisterDto) {
    await this.verifyTurnstile(dto.cfTurnstileResponse);

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) throw new ConflictException('Email sudah digunakan');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name ?? null,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }

  async login(dto: LoginDto) {
    await this.verifyTurnstile(dto.cfTurnstileResponse);

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Email atau password salah');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Email atau password salah');

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
