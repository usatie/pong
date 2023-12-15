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
    const res = await this.roomService.create(createRoomDto, user);
    this.chatService.addUserToRoom(res.id, user);
    return res;
  }

  @Get()
  @ApiOkResponse({ type: RoomEntity, isArray: true })
  findAll() {
    return this.roomService.findAllRoom();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, MemberGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RoomEntity })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.findRoom(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, MemberGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RoomEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomDto: UpdateRoomDto,
    @CurrentRole() role: Role,
  ) {
    return this.roomService.updateRoom(id, updateRoomDto, role);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, MemberGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  removeRoom(@Param('id', ParseIntPipe) id: number, @CurrentRole() role: Role) {
    return this.roomService.removeRoom(id, role);
  }

  @Post(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RoomEntity })
  async createUserOnRoom(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    const res = await this.roomService.createUserOnRoom(id, user);
    this.chatService.addUserToRoom(id, user);
    return res;
  }

  @Get(':id/:userId')
  @UseGuards(JwtAuthGuard, MemberGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserOnRoomEntity })
  getUserOnRoom(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.roomService.findUserOnRoom(id, userId);
  }

  @Delete(':id/:userId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, MemberGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  async deleteUserOnRoom(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: User,
    @CurrentRole() role: Role,
  ) {
    await this.roomService.removeUserOnRoom(id, role, userId, user);
  }

  @Patch(':id/:userId')
  @UseGuards(JwtAuthGuard, MemberGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserOnRoomEntity })
  updateUserOnRoom(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateUserOnRoomDto: UpdateUserOnRoomDto,
    @CurrentRole() role: Role,
  ) {
    return this.roomService.updateUserOnRoom(
      id,
      role,
      userId,
      updateUserOnRoomDto,
    );
  }
}
