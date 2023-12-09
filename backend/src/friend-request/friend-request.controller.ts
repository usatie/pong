import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
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

@Controller('user/:userId/friendrequest')
@ApiTags('friendrequest')
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  // Send a friend request
  @Post()
  @UseGuards(UserGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse()
  create(
    @Body() createFriendRequestDto: CreateFriendRequestDto,
    @Req() req: { user: User },
  ) {
    return this.friendRequestService.create(createFriendRequestDto, req.user);
  }

  // Get all friend requests for a user
  @Get()
  @UseGuards(UserGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: [UserEntity] })
  async findAll(@Req() req: { user: User }) {
    const users = await this.friendRequestService.findAll(req.user);
    return users.map((user) => new UserEntity(user));
  }

  // Accept a friend request
  @Patch(':requesterId/accept')
  @UseGuards(UserGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  accept(
    @Param('requesterId', ParseIntPipe) requesterId: number,
    @Req() req: { user: User },
  ) {
    return this.friendRequestService.accept(requesterId, req.user);
  }

  // Reject a friend request
  @Patch(':requesterId/reject')
  @UseGuards(UserGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  reject(
    @Param('requesterId', ParseIntPipe) requesterId: number,
    @Req() req: { user: User },
  ) {
    return this.friendRequestService.reject(requesterId, req.user);
  }

  // Cancel a friend request
  @Patch(':recipientId/cancel')
  @UseGuards(UserGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  cancel(
    @Param('recipientId', ParseIntPipe) recipientId: number,
    @Req() req: { user: User },
  ) {
    return this.friendRequestService.remove(recipientId, req.user);
  }
}
