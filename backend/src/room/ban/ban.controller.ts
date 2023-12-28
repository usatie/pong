import {
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { BanService } from './ban.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('room/:roomId/bans')
export class BanController {
  constructor(private readonly banService: BanService) {}

  @Put(':userId')
  @UseGuards(AdminGuard)
  create(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.banService.create(roomId, userId);
  }

  @Delete(':userId')
  @UseGuards(AdminGuard)
  remove(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.banService.remove(roomId, userId);
  }
}
