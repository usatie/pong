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
import { MemberGuard } from './guards/member.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { Member } from './decorators/member.decorator';
import { KickGuard } from './guards/kick.guard';
import { ChangeRoleGuard } from './guards/change-role.guard';
import { OwnerGuard } from './guards/owner.guard';

@Controller('room')
@UseGuards(JwtAuthGuard)
@ApiTags('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}
  @Post()
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
  @UseGuards(MemberGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RoomEntity })
  findOne(@Member() member: UserOnRoomEntity) {
    return this.roomService.findRoom(member.roomId);
  }

  @Patch(':roomId')
  @UseGuards(OwnerGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RoomEntity })
  update(
    @Body() updateRoomDto: UpdateRoomDto,
    @Member() member: UserOnRoomEntity,
  ) {
    return this.roomService.updateRoom(member.roomId, updateRoomDto);
  }

  @Delete(':roomId')
  @HttpCode(204)
  @UseGuards(OwnerGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  removeRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Member() member: UserOnRoomEntity,
  ) {
    return this.roomService.removeRoom(member.roomId);
  }

  @Post(':roomId')
  @ApiBearerAuth()
  @ApiOkResponse({ type: RoomEntity })
  createUserOnRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @CurrentUser() user: User,
  ) {
    return this.roomService.createUserOnRoom(roomId, user);
  }

  @Get(':roomId/messages')
  @UseGuards(MemberGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  getMessages(@Member() member: UserOnRoomEntity) {
    return this.roomService.findAllMessages(member.roomId);
  }

  @Get(':roomId/:userId')
  @UseGuards(MemberGuard)
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
  @UseGuards(MemberGuard, KickGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  deleteUserOnRoom(
    @Param('userId', ParseIntPipe) userId: number,
    @Member() member: UserOnRoomEntity,
  ) {
    return this.roomService.kickUser(member.roomId, userId);
  }

  @Patch(':roomId/:userId')
  @UseGuards(MemberGuard, ChangeRoleGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserOnRoomEntity })
  updateUserOnRoom(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateUserOnRoomDto: UpdateUserOnRoomDto,
    @Member() member: UserOnRoomEntity,
  ) {
    return this.roomService.updateUserOnRoom(
      member.roomId,
      userId,
      updateUserOnRoomDto,
    );
  }
}
