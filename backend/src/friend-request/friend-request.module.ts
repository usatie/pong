import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FriendRequestController } from './friend-request.controller';
import { FriendRequestService } from './friend-request.service';

@Module({
  controllers: [FriendRequestController],
  providers: [FriendRequestService],
  imports: [PrismaModule],
})
export class FriendRequestModule {}
