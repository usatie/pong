import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserGuard } from 'src/user/user.guard';

@UseGuards(JwtAuthGuard, UserGuard)
@ApiBearerAuth()
@Controller('user/:userId/history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createHistoryDto: CreateHistoryDto,
  ) {
    return this.historyService.create(userId, createHistoryDto);
  }

  @Get()
  findAll(@Param('userId', ParseIntPipe) userId: number) {
    return this.historyService.findAll(userId);
  }
}
