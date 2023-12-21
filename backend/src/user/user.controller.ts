import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UserGuard } from './user.guard';
import { UserService } from './user.service';

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
  @UseGuards(JwtAuthGuard, UserGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserEntity })
  async findOne(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserEntity> {
    return new UserEntity(await this.userService.findOne(userId));
  }

  @Patch(':userId')
  @UseGuards(JwtAuthGuard, UserGuard)
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
  @UseGuards(JwtAuthGuard, UserGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  async remove(@Param('userId', ParseIntPipe) userId: number): Promise<void> {
    await this.userService.remove(userId);
  }

  /* Friend requests */
  @Get(':userId/friend')
  @UseGuards(JwtAuthGuard, UserGuard)
  @ApiBearerAuth()
  async findAllFriends(@Param('userId', ParseIntPipe) userId: number) {
    const friends = await this.userService.findAllFriends(userId);
    return friends.map((friend) => new UserEntity(friend));
  }

  @Get(':userId/block')
  @UseGuards(JwtAuthGuard, UserGuard)
  @ApiBearerAuth()
  async findAllBlocked(@Param('userId', ParseIntPipe) userId: number) {
    const blocked = await this.userService.findAllBlocked(userId);
    return blocked.map((user) => new UserEntity(user));
  }

  @Post(':userId/unfriend')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, UserGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  removeFriend(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('friendId', ParseIntPipe) friendId: number,
  ): Promise<string> {
    return this.userService.removeFriend(userId, friendId);
  }

  @Post(':userId/block')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, UserGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  block(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('blockedUserId', ParseIntPipe) blockedUserId: number,
  ): Promise<string> {
    return this.userService.block(userId, blockedUserId);
  }

  @Post(':userId/unblock')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, UserGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  unblock(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('blockedUserId', ParseIntPipe) blockedUserId: number,
  ): Promise<string> {
    return this.userService.unblock(userId, blockedUserId);
  }
}
