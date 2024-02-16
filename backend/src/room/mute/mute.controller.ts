import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { CreateMuteDto } from './dto/create-mute.dto';
import { MuteService } from './mute.service';

@ApiTags('mute')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('room/:roomId/mutes')
export class MuteController {
  constructor(private readonly muteService: MuteService) {}

  @Put(':userId')
  @UseGuards(AdminGuard)
  create(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createMuteDto: CreateMuteDto,
  ) {
    return this.muteService.create(roomId, userId, createMuteDto);
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll(@Param('roomId', ParseIntPipe) roomId: number) {
    return this.muteService.findAll(roomId);
  }

  @Delete(':userId')
  @UseGuards(AdminGuard)
  remove(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.muteService.remove(roomId, userId);
  }
}
