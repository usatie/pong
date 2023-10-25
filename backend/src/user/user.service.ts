import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  findAll() {
	return this.prisma.user.findMany();
  }

  findOne(id: number) {
	return this.prisma.user.findFirst( { where: { id: id } });
  }

  update(id: number, data: Prisma.UserUpdateInput) {
	return this.prisma.user.update({
		data,
		where: { id: id },
	});
  }

  remove(id: number) {
	return this.prisma.user.delete({
		where: { id: id },
	});
  }
}
