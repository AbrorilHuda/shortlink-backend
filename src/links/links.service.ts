import {
  Injectable,
  NotFoundException,
  GoneException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { generateCode } from '../common/utils/generate-code';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import * as geoip from 'geoip-lite';

@Injectable()
export class LinksService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateLinkDto, userId: number) {
    const code = generateCode();

    return await this.prisma.link.create({
      data: {
        code,
        originalUrl: dto.url,
        userId,
        title: dto.title,
        description: dto.description,
        expiredAt: dto.expiredAt ? new Date(dto.expiredAt) : null,
        stats: {
          create: { totalClicks: 0 },
        },
      },
      include: { stats: true },
    });
  }

  /**
   * Mengambil semua link milik user tertentu.
   */
  async findAll(userId: number) {
    return await this.prisma.link.findMany({
      where: { userId },
      include: { stats: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Ambil detail link by ID — hanya jika milik user yang sedang login.
   */
  async findById(id: number, userId: number) {
    const link = await this.prisma.link.findUnique({
      where: { id },
      include: { stats: true },
    });

    if (!link) throw new NotFoundException('Link tidak ditemukan');
    if (link.userId !== userId)
      throw new ForbiddenException('Akses ditolak: bukan milik kamu');

    return link;
  }

  /**
   * Untuk redirect publik — tidak butuh auth.
   * Cek isActive dan expiredAt.
   */
  async findByCode(code: string) {
    const link = await this.prisma.link.findUnique({ where: { code } });

    if (!link) throw new NotFoundException('Link tidak ditemukan');
    if (!link.isActive) throw new NotFoundException('Link tidak aktif');

    if (link.expiredAt && link.expiredAt < new Date()) {
      throw new GoneException('Link sudah expired');
    }

    return link;
  }

  async trackClick(linkId: number, ipAddress?: string, userAgent?: string) {
    // Lookup country berdasarkan IP menggunakan geoip-lite
    let country: string | undefined;
    if (ipAddress) {
      const geo = geoip.lookup(ipAddress);
      country = geo?.country ?? undefined;
    }

    await this.prisma.clickLog.create({
      data: { linkId, ipAddress, userAgent, country },
    });

    await this.prisma.linkStat.upsert({
      where: { linkId },
      create: { linkId, totalClicks: 1, lastClickedAt: new Date() },
      update: {
        totalClicks: { increment: 1 },
        lastClickedAt: new Date(),
      },
    });
  }

  /**
   * Update link — hanya jika milik user yang sedang login.
   */
  async update(id: number, dto: UpdateLinkDto, userId: number) {
    await this.findById(id, userId);

    return await this.prisma.link.update({
      where: { id },
      data: {
        ...(dto.originalUrl && { originalUrl: dto.originalUrl }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.expiredAt !== undefined && {
          expiredAt: dto.expiredAt ? new Date(dto.expiredAt) : null,
        }),
      },
      include: { stats: true },
    });
  }

  /**
   * Hapus link — hanya jika milik user yang sedang login.
   */
  async remove(id: number, userId: number) {
    await this.findById(id, userId);
    return await this.prisma.link.delete({ where: { id } });
  }
}
