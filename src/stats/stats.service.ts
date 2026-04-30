import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getPublicStats() {
    const totalLinks = await this.prisma.link.count();
    
    const clickAggregation = await this.prisma.linkStat.aggregate({
      _sum: {
        totalClicks: true,
      },
    });

    const totalClicks = clickAggregation._sum.totalClicks || 0;

    // 99.9% is a common SLA to display, or we could calculate based on process.uptime
    const uptimePercentage = 99.9;

    return {
      totalLinks,
      totalClicks,
      uptimePercentage,
    };
  }
}
