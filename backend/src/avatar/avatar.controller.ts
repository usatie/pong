import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { CreateAvatarDto } from './dto/create-avatar.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserGuard } from 'src/user/user.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('avatar')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('avatar')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  // Public
  @Get('avatar/:filename')
  findOne() {
    return this.avatarService.findOne(0);
  }

  // Private
  @Post('/user/:userId/avatar')
  @UseGuards(UserGuard)
  create(@Body() createAvatarDto: CreateAvatarDto) {
    return this.avatarService.create(createAvatarDto);
  }

  @Put('/user/:userId/avatar')
  @UseGuards(UserGuard)
  update(@Body() updateAvatarDto: UpdateAvatarDto) {
    return this.avatarService.update(updateAvatarDto);
  }

  @Delete('/user/:userId/avatar')
  @UseGuards(UserGuard)
  remove() {
    return this.avatarService.remove(0);
  }
}
