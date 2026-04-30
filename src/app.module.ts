import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LinksModule } from './links/links.module';
import { AuthModule } from './auth/auth.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [PrismaModule, LinksModule, AuthModule, StatsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
