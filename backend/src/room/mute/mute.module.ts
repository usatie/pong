import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MuteController } from './mute.controller';
import { MuteService } from './mute.service';

@Module({
  controllers: [MuteController],
  providers: [MuteService],
  imports: [PrismaModule],
})
export class MuteModule {}
