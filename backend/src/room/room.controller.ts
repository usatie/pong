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
} from '@nestjs/swagger';
import { RoomEntity } from './entities/room.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserOnRoomEntity } from './entities/UserOnRoom.entity';
import { UpdateUserOnRoomDto } from './dto/update-UserOnRoom.dto';

@Controller('room')
@ApiTags('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: CreateRoomDto })
  create(@Body() createRoomDto: CreateRoomDto, @Req() request: Request) {
    return this.roomService.create(createRoomDto, request['user']);
  }

  @Get()
  @ApiOkResponse({ type: RoomEntity, isArray: true })
  findAll() {
    return this.roomService.findAllRoom();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RoomEntity })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    return this.roomService.findRoom(id, request['user']);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOkResponse({ type: RoomEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomDto: UpdateRoomDto,
    @Req() request: Request,
  ) {
    return this.roomService.updateRoom(id, updateRoomDto, request['user']);
  }

  @Delete(':id')
  @ApiOkResponse({ type: RoomEntity })
  removeRoom(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.removeRoom(id);
  }

  @Post(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RoomEntity })
  UserOnRoomCreate(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.roomService.createUserOnRoom(id, request['user']);
  }

  @Get(':id/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserOnRoomEntity })
  GetUserOnRoom(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Req() request: Request,
  ) {
    return this.roomService.findUserOnRoom(id, request['user'], userId);
  }

  @Delete(':id/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserOnRoomEntity })
  UserOnRoomDelete(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Req() request: Request,
  ) {
    return this.roomService.removeUserOnRoom(
      id,
      { id: userId, name: 'test' },
      userId,
    );
  }

  @Patch(':id/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserOnRoomEntity })
  UpdateUserOnRoom(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateUserOnRoomDto: UpdateUserOnRoomDto,
    @Req() request: Request,
  ) {
    return this.roomService.updateUserOnRoom(
      id,
      request['user'],
      userId,
      updateUserOnRoomDto,
    );
  }
}
