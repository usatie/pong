import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ApiTags, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { RoomEntity } from './entities/room.entity';

@Controller('room')
@ApiTags('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @ApiCreatedResponse({ type: CreateRoomDto })
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.create(createRoomDto);
  }

  @Get()
  @ApiOkResponse({ type: RoomEntity, isArray: true })
  findAll() {
    return this.roomService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: RoomEntity })
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(+id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: RoomEntity })
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomService.update(+id, updateRoomDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: RoomEntity })
  remove(@Param('id') id: string) {
    return this.roomService.remove(+id);
  }
}
