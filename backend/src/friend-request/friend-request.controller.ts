import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FriendRequestService } from './friend-request.service';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';

@Controller('user/:userId/friendrequest')
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  // Send a friend request
  @Post()
  create(@Body() createFriendRequestDto: CreateFriendRequestDto) {
    return this.friendRequestService.create(createFriendRequestDto);
  }

  // Get all friend requests for a user
  @Get()
  findAll() {
    return this.friendRequestService.findAll();
  }

  // Accept a friend request
  @Patch(':id/accept')
  accept(@Param('id') id: string) {
    return this.friendRequestService.accept(+id);
  }

  // Reject a friend request
  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.friendRequestService.reject(+id);
  }

  // Cancel a friend request
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.friendRequestService.remove(+id);
  }
}
