import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MuteService } from './mute.service';
import { MuteController } from './mute.controller';

@Module({
  controllers: [MuteController],
  providers: [MuteService],
  imports: [PrismaModule],
})
export class MuteModule {}
