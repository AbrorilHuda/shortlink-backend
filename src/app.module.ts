import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LinksModule } from './links/links.module';

@Module({
  imports: [PrismaModule, LinksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
