import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';

@Module({
  controllers: [HistoryController],
  providers: [HistoryService],
  imports: [PrismaModule],
  exports: [HistoryService],
})
export class HistoryModule {}
