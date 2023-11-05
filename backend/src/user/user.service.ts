import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { hash } from 'bcrypt';

type UserWithoutPassword = Omit<User, 'password'>;

function excludePassword(user: User): Omit<User, 'password'> {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
    const saltRounds = 10;
    const hashedPassword = await hash(createUserDto.password, saltRounds);
    const userData = { ...createUserDto, password: hashedPassword };
    return this.prisma.user.create({ data: userData }).then(excludePassword);
  }

  findAll(): Promise<UserWithoutPassword[]> {
    return this.prisma.user
      .findMany()
      .then((users) => users.map(excludePassword));
  }

  findOne(id: number): Promise<UserWithoutPassword> {
    return this.prisma.user
      .findUniqueOrThrow({ where: { id: id } })
      .then(excludePassword);
  }

  update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserWithoutPassword> {
    return this.prisma.user
      .update({
        where: { id: id },
        data: updateUserDto,
      })
      .then(excludePassword);
  }

  remove(id: number): Promise<UserWithoutPassword> {
    return this.prisma.user
      .delete({
        where: { id: id },
      })
      .then(excludePassword);
  }
}
