import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.user.delete({
      where: { id: id },
    });
  }

  /* Friend requests */
  async findAllFriends(user: User) {
    const res = await this.prisma.user.findFirstOrThrow({
      where: { id: user.id },
      include: { friends: true, friendsOf: true },
    });
    return [...res.friends, ...res.friendsOf];
  }
}
