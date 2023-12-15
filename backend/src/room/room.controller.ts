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
  Req,
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
  async create(@Body() createRoomDto: CreateRoomDto, @Req() req: { user }) {
    const res = await this.roomService.create(createRoomDto, req.user);
    this.chatService.addUserToRoom(res.id, req.user);
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
    @Req() request: Request,
  ) {
    return this.roomService.updateRoom(id, updateRoomDto, request['userRole']);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, MemberGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  removeRoom(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    return this.roomService.removeRoom(id, request['userRole']);
  }

  @Post(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RoomEntity })
  async createUserOnRoom(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    const res = await this.roomService.createUserOnRoom(id, request['user']);
    this.chatService.addUserToRoom(id, request['user']);
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
    @Req() request: Request,
  ) {
    await this.roomService.removeUserOnRoom(
      id,
      request['userRole'],
      userId,
      request['user'],
    );
  }

  @Patch(':id/:userId')
  @UseGuards(JwtAuthGuard, MemberGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserOnRoomEntity })
  updateUserOnRoom(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateUserOnRoomDto: UpdateUserOnRoomDto,
    @Req() request: Request,
  ) {
    return this.roomService.updateUserOnRoom(
      id,
      request['userRole'],
      userId,
      updateUserOnRoomDto,
    );
  }
}
