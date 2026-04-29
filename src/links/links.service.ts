import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { generateCode } from '../common/utils/generate-code';

@Injectable()
export class LinksService {
  constructor(private prisma: PrismaService) {}

  async create(url: string) {
    const code = generateCode();

    const result = await this.prisma.link.create({
      data: {
        code,
        originalUrl: url,
      },
    });

    return result;
  }

  async findByCode(code: string) {
    return await this.prisma.link.findUnique({
      where: { code },
    });
  }
}
