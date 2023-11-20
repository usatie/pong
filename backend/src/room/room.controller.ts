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
    return this.roomService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RoomEntity })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    return this.roomService.findOne(id, request['user']);
  }

  @Patch(':id')
  @ApiOkResponse({ type: RoomEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomService.update(id, updateRoomDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: RoomEntity })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.remove(id);
  }

  @Post(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RoomEntity })
  enterRoom(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    return this.roomService.enterRoom(id, request['user']['id']);
  }
}
