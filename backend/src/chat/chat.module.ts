import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserService } from '../user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, UserService],
  imports: [PrismaModule, AuthModule],
  exports: [ChatService],
})
export class ChatModule {}
