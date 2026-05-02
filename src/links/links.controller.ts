import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { successResponse } from '../common/helpers/response.helper';
import { getClientIp } from '../common/utils/get-client-ip';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import type { UserPayload } from '../common/decorators/get-user.decorator';
import { type Response, type Request } from 'express';

@Controller()
export class LinksController {
  constructor(private linksService: LinksService) {}

  @UseGuards(JwtAuthGuard)
  @Post('links')
  async create(@Body() dto: CreateLinkDto, @GetUser() user: UserPayload) {
    const link = await this.linksService.create(dto, user.id);
    return successResponse(link, 'Link berhasil dibuat');
  }

  @UseGuards(JwtAuthGuard)
  @Get('links')
  async findAll(@GetUser() user: UserPayload) {
    const links = await this.linksService.findAll(user.id);
    return successResponse(links, 'Berhasil mengambil semua link');
  }

  @UseGuards(JwtAuthGuard)
  @Get('links/:id')
  async findOne(@Param('id') id: string, @GetUser() user: UserPayload) {
    const link = await this.linksService.findById(id, user.id);
    return successResponse(link, 'Berhasil mengambil link');
  }

  @UseGuards(JwtAuthGuard)
  @Patch('links/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLinkDto,
    @GetUser() user: UserPayload,
  ) {
    const link = await this.linksService.update(id, dto, user.id);
    return successResponse(link, 'Link berhasil diupdate');
  }

  @UseGuards(JwtAuthGuard)
  @Delete('links/:id')
  async remove(@Param('id') id: string, @GetUser() user: UserPayload) {
    await this.linksService.remove(id, user.id);
    return successResponse(null, 'Link berhasil dihapus');
  }

  @UseGuards(JwtAuthGuard)
  @Get('links/:id/stats')
  async getStats(@Param('id') id: string, @GetUser() user: UserPayload) {
    const stats = await this.linksService.getLinkStats(id, user.id);
    return successResponse(stats, 'Berhasil mengambil statistik link');
  }

  @Get(':code')
  async redirect(
    @Param('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const link = await this.linksService.findByCode(code);

      const ip = getClientIp(req);
      const userAgent = req.get('user-agent');

      // Track klik secara non-blocking (tidak menghambat redirect)
      this.linksService.trackClick(link.id, ip, userAgent).catch(() => {});

      if (req.headers.accept?.includes('application/json')) {
        return res.json({
          success: true,
          message: 'Redirect info',
          data: {
            originalUrl: link.originalUrl,
            title: link.title,
            description: link.description,
          },
        });
      }

      return res.redirect(link.originalUrl);
    } catch (err: any) {
      if (req.headers.accept?.includes('application/json')) {
        return res.status(err.status ?? 404).json({
          success: false,
          message: err.message ?? 'Link tidak ditemukan',
          data: null,
        });
      }
      return res
        .status(err.status ?? 404)
        .send(err.message ?? 'Link tidak ditemukan');
    }
  }
}
