import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';
import { successResponse } from '../common/helpers/response.helper';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  async getPublicOverview() {
    const stats = await this.statsService.getPublicStats();
    return successResponse(stats, 'Berhasil mengambil statistik publik');
  }
}
