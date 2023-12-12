import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [HistoryController],
  providers: [HistoryService],
  imports: [PrismaModule],
})
export class HistoryModule {}
