import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserService } from '../user/user.service';

@Module({
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, UserService],
  imports: [PrismaModule],
})
export class ChatModule {}
