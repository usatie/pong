import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserGuard } from 'src/user/user.guard';
import { CreateHistoryDto } from './dto/create-history.dto';
import { HistoryService } from './history.service';

@Controller()
@ApiTags('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  // TODO: remove this endpoint
  // Match result should be created by the game server
  @Post('history')
  @ApiCreatedResponse()
  create(@Body() createHistoryDto: CreateHistoryDto) {
    return this.historyService.create(createHistoryDto);
  }

  @Get('user/:userId/history')
  @UseGuards(JwtAuthGuard, UserGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  findAll(@Param('userId', ParseIntPipe) userId: number) {
    return this.historyService.findAll(userId);
  }
}
