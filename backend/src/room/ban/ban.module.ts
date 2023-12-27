import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BanController } from './ban.controller';
import { BanService } from './ban.service';

@Module({
  controllers: [BanController],
  providers: [BanService],
  imports: [PrismaModule],
})
export class BanModule {}
