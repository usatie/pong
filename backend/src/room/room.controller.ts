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
import { Role, User } from '@prisma/client';
import { CurrentRole } from './current-role.decorator';

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
  @ApiCreatedResponse({ type: CreateRoomDto })
  async create(
    @Body() createRoomDto: CreateRoomDto,
    @CurrentUser() user: User,
  ) {
    const room = await this.roomService.create(createRoomDto, user);
    this.chatService.addUserToRoom(room.id, user);
    return room;
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
  findOne(@Param('roomId', ParseIntPipe) roomId: number) {
    return this.roomService.findRoom(roomId);
  }

  @Patch(':roomId')
  @UseGuards(JwtAuthGuard, MemberGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RoomEntity })
  update(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body() updateRoomDto: UpdateRoomDto,
    @CurrentRole() role: Role,
  ) {
    return this.roomService.updateRoom(roomId, updateRoomDto, role);
  }

  @Delete(':roomId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, MemberGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  removeRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @CurrentRole() role: Role,
  ) {
    return this.roomService.removeRoom(roomId, role);
  }

  @Post(':roomId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RoomEntity })
  async createUserOnRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @CurrentUser() user: User,
  ) {
    const res = await this.roomService.createUserOnRoom(roomId, user);
    this.chatService.addUserToRoom(roomId, user);
    return res;
  }

  @Get(':roomId/:userId')
  @UseGuards(JwtAuthGuard, MemberGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserOnRoomEntity })
  getUserOnRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.roomService.findUserOnRoom(roomId, userId);
  }

  @Delete(':roomId/:userId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, MemberGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  async deleteUserOnRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: User,
    @CurrentRole() role: Role,
  ) {
    await this.roomService.removeUserOnRoom(roomId, role, userId, user);
  }

  @Patch(':roomId/:userId')
  @UseGuards(JwtAuthGuard, MemberGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserOnRoomEntity })
  updateUserOnRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateUserOnRoomDto: UpdateUserOnRoomDto,
    @CurrentRole() role: Role,
  ) {
    return this.roomService.updateUserOnRoom(
      roomId,
      role,
      userId,
      updateUserOnRoomDto,
    );
  }
}
