import { Module } from '@nestjs/common';
import { FriendRequestService } from './friend-request.service';
import { FriendRequestController } from './friend-request.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [FriendRequestController],
  providers: [FriendRequestService],
  imports: [PrismaModule],
})
export class FriendRequestModule {}
