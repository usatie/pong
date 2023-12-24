import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Member } from './decorators/member.decorator';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateUserOnRoomDto } from './dto/update-UserOnRoom.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { UserOnRoomEntity } from './entities/UserOnRoom.entity';
import { RoomEntity } from './entities/room.entity';
import { AdminGuard } from './guards/admin.guard';
import { ChangeRoleGuard } from './guards/change-role.guard';
import { EnterRoomGuard } from './guards/enter-room.guard';
import { GetRoomGuard } from './guards/get-room.guard';
import { KickGuard } from './guards/kick.guard';
import { MemberGuard } from './guards/member.guard';
import { OwnerGuard } from './guards/owner.guard';
import { RoomService } from './room.service';

@Controller('room')
@UseGuards(JwtAuthGuard)
@ApiTags('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}
  @Post()
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: RoomEntity })
  async create(
    @Body() createRoomDto: CreateRoomDto,
    @CurrentUser() user: User,
  ) {
    return new RoomEntity(await this.roomService.create(createRoomDto, user));
  }

  @Get()
  @ApiOkResponse({ type: RoomEntity, isArray: true })
  async findAll(@CurrentUser() user: User) {
    const rooms = await this.roomService.findAllRoom(user.id);
    return rooms.map((room) => new RoomEntity(room));
  }

  @Get(':roomId')
  @UseGuards(GetRoomGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RoomEntity })
  async findOne(@Param('roomId', ParseIntPipe) roomId: number) {
    return new RoomEntity(await this.roomService.findRoom(roomId));
  }

  @Patch(':roomId')
  @UseGuards(OwnerGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RoomEntity })
  async update(
    @Body() updateRoomDto: UpdateRoomDto,
    @Member() member: UserOnRoomEntity,
  ) {
    return new RoomEntity(
      await this.roomService.updateRoom(member.roomId, updateRoomDto),
    );
  }

  @Delete(':roomId')
  @HttpCode(204)
  @UseGuards(OwnerGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  async removeRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Member() member: UserOnRoomEntity,
  ) {
    return new RoomEntity(await this.roomService.removeRoom(member.roomId));
  }

  @Post(':roomId')
  @UseGuards(EnterRoomGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserOnRoomEntity })
  enterRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @CurrentUser() user: User,
  ) {
    return this.roomService.enterRoom(roomId, user);
  }

  // TODO: Implement AdminGuard
  @Post(':roomId/invite/:userId')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserOnRoomEntity })
  invite(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.roomService.inviteUser(roomId, userId);
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
