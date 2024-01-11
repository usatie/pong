import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '@prisma/client';
import { hash } from 'bcrypt';
import { BlockEvent } from 'src/common/events/block.event';
import { UnblockEvent } from 'src/common/events/unblock.event';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return hash(password, saltRounds);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.hashPassword(createUserDto.password);
    const userData = { ...createUserDto, password: hashedPassword };
    return this.prisma.user.create({ data: userData });
  }

  findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  findOne(id: number): Promise<User> {
    return this.prisma.user.findUniqueOrThrow({ where: { id: id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const userData = { ...updateUserDto };
    if (userData.password) {
      userData.password = await this.hashPassword(userData.password);
    }
    return this.prisma.user.update({
      where: { id: id },
      data: userData,
    });
  }

  remove(id: number): Promise<User> {
    return this.prisma.user
      .delete({
        where: { id: id },
      })
      .then((user) => {
        if (!user.avatarURL) return user;
        const filepath = path.join('./public', user.avatarURL);
        fs.rmSync(filepath, { force: true });
        return user;
      });
  }

  /* Friend requests */
  async findAllFriends(userId: number) {
    const res = await this.prisma.user.findFirstOrThrow({
      where: { id: userId },
      include: { friends: true, friendsOf: true },
    });
    return [...res.friends, ...res.friendsOf];
  }

  async removeFriend(userId: number, friendId: number) {
    return this.prisma.user
      .update({
        where: { id: userId },
        data: {
          friends: {
            disconnect: { id: friendId },
          },
          friendsOf: {
            disconnect: { id: friendId },
          },
        },
      })
      .then(() => 'Unfriended');
  }

  /* Block requests */
  async block(userId: number, blockedUserId: number) {
    return this.prisma.user
      .update({
        where: { id: userId },
        data: {
          blocking: {
            connect: { id: blockedUserId },
          },
          friends: {
            disconnect: { id: blockedUserId },
          },
          friendsOf: {
            disconnect: { id: blockedUserId },
          },
        },
      })
      .then(() => {
        const event: BlockEvent = {
          blockerId: userId,
          blockedId: blockedUserId,
        };
        this.eventEmitter.emit('block', event);
        return 'Blocked';
      });
  }

  async unblock(userId: number, blockedUserId: number) {
    return this.prisma.user
      .update({
        where: { id: userId },
        data: {
          blocking: {
            disconnect: { id: blockedUserId },
          },
        },
      })
      .then(() => {
        const event: UnblockEvent = {
          unblockerId: userId,
          unblockedId: blockedUserId,
        };
        this.eventEmitter.emit('unblock', event);
        return 'Unblocked';
      });
  }

  async findAllBlocked(userId: number) {
    const res = await this.prisma.user.findFirstOrThrow({
      where: { id: userId },
      include: { blocking: true },
    });
    return res.blocking;
  }
}
