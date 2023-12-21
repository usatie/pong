import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PublicUserEntity } from 'src/user/entities/public-user.entity';
import { UserGuard } from 'src/user/user.guard';
import { FriendRequestsEntity } from './entities/friend-requests.entity';
import { FriendRequestService } from './friend-request.service';

@Controller('user/:userId/friend-request')
@UseGuards(JwtAuthGuard, UserGuard)
@ApiBearerAuth()
@ApiTags('friendrequest')
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  // Send a friend request
  @Post(':recipientId')
  @ApiCreatedResponse()
  create(
    @Param('recipientId', ParseIntPipe) recipientId: number,
    @CurrentUser() user: User,
  ) {
    return this.friendRequestService.create(recipientId, user);
  }

  // Get all friend requests for a user
  @Get()
  @ApiOkResponse({ type: PublicUserEntity })
  async findAll(@CurrentUser() user: User) {
    const res = await this.friendRequestService.findAll(user);
    return new FriendRequestsEntity(res);
  }

  // Accept a friend request
  @Patch(':requesterId/accept')
  @ApiOkResponse()
  accept(
    @Param('requesterId', ParseIntPipe) requesterId: number,
    @CurrentUser() user: User,
  ) {
    return this.friendRequestService.accept(requesterId, user);
  }

  // Reject a friend request
  @Patch(':requesterId/reject')
  @ApiOkResponse()
  reject(
    @Param('requesterId', ParseIntPipe) requesterId: number,
    @CurrentUser() user: User,
  ) {
    return this.friendRequestService.reject(requesterId, user);
  }

  // Cancel a friend request
  @Patch(':recipientId/cancel')
  @ApiOkResponse()
  cancel(
    @Param('recipientId', ParseIntPipe) recipientId: number,
    @CurrentUser() user: User,
  ) {
    return this.friendRequestService.cancel(recipientId, user);
  }
}
