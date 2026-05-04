import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getPublicStats() {
    const [totalLinks, totalUsers, clickAggregation] = await Promise.all([
      this.prisma.link.count(),
      this.prisma.user.count(),
      this.prisma.linkStat.aggregate({
        _sum: {
          totalClicks: true,
        },
      }),
    ]);

    const totalClicks = clickAggregation._sum.totalClicks || 0;

    const uptimePercentage = 99.9;

    return {
      totalUsers,
      totalLinks,
      totalClicks,
      uptimePercentage,
    };
  }
}
