import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  controllers: [RoomController],
  providers: [RoomService],
  imports: [PrismaModule, ChatModule],
})
export class RoomModule {}
