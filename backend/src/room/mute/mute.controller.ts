import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CreateMuteDto } from './dto/create-mute.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
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
}
