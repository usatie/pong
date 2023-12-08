import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  UnauthorizedException,
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

@Controller('user/:userId/friendrequest')
@ApiTags('friendrequest')
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  // Send a friend request
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse()
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createFriendRequestDto: CreateFriendRequestDto,
    @Req() req: { user: User },
  ) {
    if (req.user.id !== userId) {
      throw new UnauthorizedException();
    }
    return this.friendRequestService.create(createFriendRequestDto, req.user);
  }

  // Get all friend requests for a user
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: [UserEntity] })
  async findAll(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: { user: User },
  ) {
    if (req.user.id !== userId) {
      throw new UnauthorizedException();
    }
    const users = await this.friendRequestService.findAll(req.user);
    return users.map((user) => new UserEntity(user));
  }

  // Accept a friend request
  @Patch(':requesterId/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  accept(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('requesterId', ParseIntPipe) requesterId: number,
    @Req() req: { user: User },
  ) {
    if (req.user.id !== userId) {
      throw new UnauthorizedException();
    }
    return this.friendRequestService.accept(requesterId, req.user);
  }

  // Reject a friend request
  @Patch(':requesterId/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  reject(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('requesterId', ParseIntPipe) requesterId: number,
    @Req() req: { user: User },
  ) {
    if (req.user.id !== userId) {
      throw new UnauthorizedException();
    }
    return this.friendRequestService.reject(requesterId, req.user);
  }

  // Cancel a friend request
  @Patch(':recipientId/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  cancel(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('recipientId', ParseIntPipe) recipientId: number,
    @Req() req: { user: User },
  ) {
    if (req.user.id !== userId) {
      throw new UnauthorizedException();
    }
    return this.friendRequestService.remove(recipientId, req.user);
  }
}
