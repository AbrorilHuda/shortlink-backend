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
import UAParser from 'ua-parser-js';

@Injectable()
export class LinksService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateLinkDto, userId: number) {
    let code = dto.code;

    if (code) {
      const existing = await this.prisma.link.findUnique({ where: { code } });
      if (existing) {
        throw new ForbiddenException('Custom code sudah digunakan');
      }
    } else {
      code = generateCode();
    }

    return await this.prisma.link.create({
      data: {
        code,
        originalUrl: dto.url.match(/^https?:\/\//i) ? dto.url : `http://${dto.url}`,
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
  async findById(id: string, userId: number) {
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

  async trackClick(linkId: string, ipAddress?: string, userAgent?: string) {
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
  async update(id: string, dto: UpdateLinkDto, userId: number) {
    const link = await this.findById(id, userId);

    if (dto.code && dto.code !== link.code) {
      const existing = await this.prisma.link.findUnique({ where: { code: dto.code } });
      if (existing) {
        throw new ForbiddenException('Custom code sudah digunakan');
      }
    }

    return await this.prisma.link.update({
      where: { id },
      data: {
        ...(dto.code && { code: dto.code }),
        ...(dto.url && { originalUrl: dto.url.match(/^https?:\/\//i) ? dto.url : `http://${dto.url}` }),
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
  async remove(id: string, userId: number) {
    await this.findById(id, userId);
    return await this.prisma.link.delete({ where: { id } });
  }

  /**
   * Mengambil statistik detail dari suatu link
   */
  async getLinkStats(id: string, userId: number) {
    const link = await this.findById(id, userId);

    const clicks = await this.prisma.clickLog.findMany({
      where: { linkId: id },
    });

    const countryCount: Record<string, number> = {};
    const browserCount: Record<string, number> = {};



    for (const click of clicks) {
      // Country
      const country = click.country || 'Unknown';
      countryCount[country] = (countryCount[country] || 0) + 1;

      // Browser
      let browserName = 'Unknown';
      if (click.userAgent) {
        const parser = new UAParser(click.userAgent);
        const browser = parser.getBrowser();
        if (browser.name) {
          browserName = browser.name;
        }
      }
      browserCount[browserName] = (browserCount[browserName] || 0) + 1;
    }

    const topCountries = Object.entries(countryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const topBrowsers = Object.entries(browserCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalClicks: link.stats?.totalClicks || 0,
      topCountries,
      topBrowsers,
    };
  }
}
