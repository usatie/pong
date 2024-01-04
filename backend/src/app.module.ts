import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AvatarModule } from './avatar/avatar.module';
import { ChatModule } from './chat/chat.module';
import { EventsModule } from './events/events.module';
import { FriendRequestModule } from './friend-request/friend-request.module';
import { HistoryModule } from './history/history.module';
import { PrismaModule } from './prisma/prisma.module';
import { BanModule } from './room/ban/ban.module';
import { RoomModule } from './room/room.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    UserModule,
    PrismaModule,
    AuthModule,
    BanModule,
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
