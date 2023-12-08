import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
  @Patch(':requestId/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  accept(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('requestId', ParseIntPipe) requestId: number,
    @Req() req: { user: User },
  ) {
    if (req.user.id !== userId) {
      throw new UnauthorizedException();
    }
    return this.friendRequestService.accept(requestId);
  }

  // Reject a friend request
  @Patch(':requestId/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  reject(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('requestId', ParseIntPipe) requestId: number,
    @Req() req: { user: User },
  ) {
    if (req.user.id !== userId) {
      throw new UnauthorizedException();
    }
    return this.friendRequestService.reject(requestId);
  }

  // Cancel a friend request
  @Delete(':requestId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('requestId', ParseIntPipe) requestId: number,
    @Req() req: { user: User },
  ) {
    if (req.user.id !== userId) {
      throw new UnauthorizedException();
    }
    return this.friendRequestService.remove(requestId);
  }
}
