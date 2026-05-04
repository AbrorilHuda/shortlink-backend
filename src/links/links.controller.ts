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
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { VerifyPasswordDto } from './dto/verify-password.dto';
import { successResponse } from '../common/helpers/response.helper';
import { getClientIp } from '../common/utils/get-client-ip';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import type { UserPayload } from '../common/decorators/get-user.decorator';
import { type Response, type Request } from 'express';

function getHttpExceptionMessage(exception: HttpException): string {
  const response = exception.getResponse();
  if (typeof response === 'string') return response;

  if (response && typeof response === 'object') {
    const maybeMessage = (response as Record<string, unknown>).message;
    if (typeof maybeMessage === 'string') return maybeMessage;
    if (
      Array.isArray(maybeMessage) &&
      maybeMessage.every((item) => typeof item === 'string')
    ) {
      return maybeMessage.join(', ');
    }
  }

  return exception.message;
}

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

  @Post(':code/verify-password')
  async verifyPassword(
    @Param('code') code: string,
    @Body() dto: VerifyPasswordDto,
    @Req() req: Request,
  ) {
    const result = await this.linksService.verifyPassword(code, dto.password);
    const ip = getClientIp(req);
    const userAgent = req.get('user-agent');
    const link = await this.linksService.findByCode(code);
    this.linksService.trackClick(link.id, ip, userAgent).catch(() => {});

    return successResponse(result, 'Password benar');
  }

  @Get(':code')
  async redirect(
    @Param('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const link = await this.linksService.findByCode(code);

      const wantsJson = req.headers.accept?.includes('application/json');
      const shouldTrack = !wantsJson || req.headers['x-track-click'] === 'true';

      const isProtected = !!link.password;

      if (isProtected && !wantsJson) {
        throw new ForbiddenException('Link ini dilindungi password');
      }

      if (shouldTrack && !isProtected) {
        const ip = getClientIp(req);
        const userAgent = req.get('user-agent');

        // Track klik secara non-blocking (tidak menghambat redirect)
        this.linksService.trackClick(link.id, ip, userAgent).catch(() => {});
      }

      // Untuk kebutuhan FE (metadata/preview) kembalikan JSON
      if (wantsJson) {
        return res.json({
          success: true,
          message: isProtected ? 'Link dilindungi password' : 'Redirect info',
          data: {
            originalUrl: isProtected ? null : link.originalUrl,
            title: link.title,
            description: link.description,
            isProtected,
          },
        });
      }

      return res.redirect(link.originalUrl);
    } catch (err: unknown) {
      const wantsJson = req.headers.accept?.includes('application/json');
      const status = err instanceof HttpException ? err.getStatus() : 404;
      const message =
        err instanceof HttpException
          ? getHttpExceptionMessage(err)
          : err instanceof Error
            ? err.message
            : 'Link tidak ditemukan';

      if (wantsJson) {
        return res.status(status).json({
          success: false,
          message,
          data: null,
        });
      }

      return res.status(status).send(message);
    }
  }
}
