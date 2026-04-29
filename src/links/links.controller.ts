import { Controller, Post, Body, Get, Param, Res } from '@nestjs/common';
import { LinksService } from './links.service';
import { type Response } from 'express';

@Controller()
export class LinksController {
  constructor(private linksService: LinksService) {}

  @Post('links')
  create(@Body('url') url: string) {
    return this.linksService.create(url);
  }

  @Get(':code')
  async redirect(@Param('code') code: string, @Res() res: Response) {
    const link = await this.linksService.findByCode(code);

    if (!link) {
      return res.status(404).send('Not found');
    }

    return res.redirect(link.originalUrl);
  }
}
