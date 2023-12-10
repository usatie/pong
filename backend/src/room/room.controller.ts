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
import { RoomRolesGuard } from './room-member.guard';
import { roleNeed } from './roles.decorators';
import { Role } from '@prisma/client';

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

  @Patch(':id')
  @roleNeed(Role.OWNER)
  @UseGuards(JwtAuthGuard, RoomRolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RoomEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomDto: UpdateRoomDto,
    @Req() request: Request,
  ) {
    return this.roomService.updateRoom(id, updateRoomDto, request['user']);
  }

  @Delete(':id')
  @HttpCode(204)
  @roleNeed(Role.OWNER)
  @UseGuards(JwtAuthGuard, RoomRolesGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  async removeRoom(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    await this.roomService.removeRoom(id, request['user']);
  }

  @Post(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RoomEntity })
  createUserOnRoom(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    return this.roomService.createUserOnRoom(id, request['user']);
  }

  @Get(':id/:userId')
  @roleNeed(Role.MEMBER)
  @UseGuards(JwtAuthGuard, RoomRolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserOnRoomEntity })
  getUserOnRoom(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Req() request: Request,
  ) {
    return this.roomService.findUserOnRoom(id, request['user'], userId);
  }

  @Delete(':id/:userId')
  @HttpCode(204)
  @roleNeed(Role.MEMBER)
  @UseGuards(JwtAuthGuard, RoomRolesGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  async deleteUserOnRoom(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    await this.roomService.removeUserOnRoom(
      id,
      { id: userId, name: 'test' },
      userId,
    );
  }

  @Patch(':id/:userId')
  @roleNeed(Role.MEMBER)
  @UseGuards(JwtAuthGuard, RoomRolesGuard)
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
      request['user'],
      userId,
      updateUserOnRoomDto,
    );
  }
}
