import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserGuard } from './user.guard';
import { User } from '@prisma/client';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiCreatedResponse({ type: UserEntity })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    const user = await this.userService.create(createUserDto);
    return new UserEntity(user);
  }

  @Get()
  @ApiOkResponse({ type: [UserEntity] })
  async findAll(): Promise<UserEntity[]> {
    const users = await this.userService.findAll();
    return users.map((user) => new UserEntity(user));
  }

  @Get(':userId')
  @UseGuards(UserGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserEntity })
  async findOne(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserEntity> {
    return new UserEntity(await this.userService.findOne(userId));
  }

  @Patch(':userId')
  @UseGuards(UserGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserEntity })
  async update(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    return new UserEntity(await this.userService.update(userId, updateUserDto));
  }

  @Delete(':userId')
  @HttpCode(204)
  @UseGuards(UserGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  async remove(@Param('userId', ParseIntPipe) userId: number): Promise<void> {
    await this.userService.remove(userId);
  }

  /* Friend requests */
  @Get(':userId/friend')
  @UseGuards(UserGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAllFriends(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: { user: User },
  ) {
    const friends = await this.userService.findAllFriends(req.user);
    return friends.map((friend) => new UserEntity(friend));
  }

  @Get(':userId/block')
  @UseGuards(UserGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAllBlocked(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: { user: User },
  ) {
    const blocked = await this.userService.findAllBlocked(req.user);
    return blocked.map((user) => new UserEntity(user));
  }

  @Post(':userId/unfriend')
  @HttpCode(200)
  @UseGuards(UserGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  removeFriend(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('friendId', ParseIntPipe) friendId: number,
    @Req() req: { user: User },
  ): Promise<string> {
    return this.userService.removeFriend(friendId, req.user);
  }

  @Post(':userId/block')
  @HttpCode(200)
  @UseGuards(UserGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  block(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('blockedUserId', ParseIntPipe) blockedUserId: number,
    @Req() req: { user: User },
  ): Promise<string> {
    return this.userService.block(blockedUserId, req.user);
  }

  @Post(':userId/unblock')
  @HttpCode(200)
  @UseGuards(UserGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  async unblock(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('blockedUserId', ParseIntPipe) blockedUserId: number,
    @Req() req: { user: User },
  ): Promise<void> {
    // TODO: Implement this
    //await this.userService.unblock(blockedUserId, req.user);
  }
}
