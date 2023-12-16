import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RoomModule } from './room/room.module';
import { EventsModule } from './events/events.module';
import { ChatModule } from './chat/chat.module';
import { FriendRequestModule } from './friend-request/friend-request.module';
import { AvatarModule } from './avatar/avatar.module';
import { HistoryModule } from './history/history.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    UserModule,
    PrismaModule,
    AuthModule,
    RoomModule,
    EventsModule,
    ChatModule,
    FriendRequestModule,
    AvatarModule,
    HistoryModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
