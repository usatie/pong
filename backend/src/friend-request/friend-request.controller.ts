import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { FriendRequestService } from './friend-request.service';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from '@prisma/client';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserGuard } from 'src/user/user.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('user/:userId/friendrequest')
@UseGuards(JwtAuthGuard, UserGuard)
@ApiBearerAuth()
@ApiTags('friendrequest')
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  // Send a friend request
  @Post()
  @ApiCreatedResponse()
  create(
    @Body() createFriendRequestDto: CreateFriendRequestDto,
    @CurrentUser() user: User,
  ) {
    return this.friendRequestService.create(createFriendRequestDto, user);
  }

  // Get all friend requests for a user
  @Get()
  @ApiOkResponse({ type: [UserEntity] })
  async findAll(@CurrentUser() user: User) {
    const users = await this.friendRequestService.findAll(user);
    return users.map((user) => new UserEntity(user));
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
