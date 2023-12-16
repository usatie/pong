import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { RoomEntity } from './entities/room.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserOnRoomEntity } from './entities/UserOnRoom.entity';
import { UpdateUserOnRoomDto } from './dto/update-UserOnRoom.dto';
import { MemberGuard } from './member.guard';
import { ChatService } from 'src/chat/chat.service';
import { CurrentUser } from 'src/common/current-user.decorator';
import { User } from '@prisma/client';
import { Member } from './member.decorator';

@Controller('room')
@ApiTags('room')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private chatService: ChatService,
  ) {}
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: RoomEntity })
  create(@Body() createRoomDto: CreateRoomDto, @CurrentUser() user: User) {
    return this.roomService.create(createRoomDto, user);
  }

  @Get()
  @ApiOkResponse({ type: RoomEntity, isArray: true })
  findAll() {
    return this.roomService.findAllRoom();
  }

  @Get(':roomId')
  @UseGuards(JwtAuthGuard, MemberGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RoomEntity })
  findOne(@Member() member: UserOnRoomEntity) {
    return this.roomService.findRoom(member.roomId);
  }

  @Patch(':roomId')
  @UseGuards(JwtAuthGuard, MemberGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RoomEntity })
  update(
    @Body() updateRoomDto: UpdateRoomDto,
    @Member() member: UserOnRoomEntity,
  ) {
    return this.roomService.updateRoom(
      member.roomId,
      updateRoomDto,
      member.role,
    );
  }

  @Delete(':roomId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, MemberGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  removeRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Member() member: UserOnRoomEntity,
  ) {
    return this.roomService.removeRoom(member.roomId, member.role);
  }

  @Post(':roomId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RoomEntity })
  createUserOnRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @CurrentUser() user: User,
  ) {
    return this.roomService.createUserOnRoom(roomId, user);
  }

  @Get(':roomId/:userId')
  @UseGuards(JwtAuthGuard, MemberGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserOnRoomEntity })
  getUserOnRoom(
    @Param('userId', ParseIntPipe) userId: number,
    @Member() member: UserOnRoomEntity,
  ) {
    return this.roomService.findUserOnRoom(member.roomId, userId);
  }

  @Delete(':roomId/:userId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, MemberGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  async deleteUserOnRoom(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: User,
    @Member() member: UserOnRoomEntity,
  ) {
    await this.roomService.removeUserOnRoom(
      member.roomId,
      member.role,
      userId,
      user,
    );
  }

  @Patch(':roomId/:userId')
  @UseGuards(JwtAuthGuard, MemberGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserOnRoomEntity })
  updateUserOnRoom(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateUserOnRoomDto: UpdateUserOnRoomDto,
    @Member() member: UserOnRoomEntity,
  ) {
    return this.roomService.updateUserOnRoom(
      member.roomId,
      member.role,
      userId,
      updateUserOnRoomDto,
    );
  }
}
