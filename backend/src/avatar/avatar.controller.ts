import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Put,
  Param,
  Res,
} from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { CreateAvatarDto } from './dto/create-avatar.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserGuard } from 'src/user/user.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@Controller()
@ApiTags('avatar')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  // Public
  @Get('avatar/:filename')
  findOne(@Param('filename') filename: string, @Res() res: Response) {
    res.sendFile(filename, { root: 'public/avatar' });
  }

  // Private
  @Post('/user/:userId/avatar')
  @UseGuards(JwtAuthGuard, UserGuard)
  @ApiBearerAuth()
  create(@Body() createAvatarDto: CreateAvatarDto) {
    return this.avatarService.create(createAvatarDto);
  }

  @Put('/user/:userId/avatar')
  @UseGuards(JwtAuthGuard, UserGuard)
  @ApiBearerAuth()
  update(@Body() updateAvatarDto: UpdateAvatarDto) {
    return this.avatarService.update(updateAvatarDto);
  }

  @Delete('/user/:userId/avatar')
  @UseGuards(JwtAuthGuard, UserGuard)
  @ApiBearerAuth()
  remove() {
    ///
    return this.avatarService.remove(0);
  }
}
