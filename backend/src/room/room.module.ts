import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { BanModule } from './ban/ban.module';

@Module({
  controllers: [RoomController],
  providers: [RoomService],
  imports: [PrismaModule, BanModule],
})
export class RoomModule {}
