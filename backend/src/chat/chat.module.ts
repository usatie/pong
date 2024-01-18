import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { MuteService } from 'src/room/mute/mute.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserService } from '../user/user.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, MuteService, UserService],
  imports: [PrismaModule, AuthModule],
})
export class ChatModule {}
