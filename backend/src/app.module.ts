import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RoomModule } from './room/room.module';

@Module({
  imports: [UserModule, PrismaModule, AuthModule, RoomModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
