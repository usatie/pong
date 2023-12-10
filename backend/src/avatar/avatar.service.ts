import { Injectable } from '@nestjs/common';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as fs from 'fs';

@Injectable()
export class AvatarService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, file: Express.Multer.File) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const avatarURL = `/avatar/${file.filename}`;
    return this.prisma.user
      .update({
        where: { id: userId },
        data: { avatarURL },
      })
      .then(() => {
        // Delete old avatar
        if (user.avatarURL) {
          fs.rmSync('./public' + user.avatarURL, { force: true });
        }
        return { filename: file.filename, url: avatarURL };
      });
  }

  findOne(filename: string) {
    return `This action returns a #${filename} avatar`;
  }

  async remove(userId: number) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    return this.prisma.user
      .delete({
        where: { id: userId },
      })
      .then(() => {
        if (!user.avatarURL) return user;
        fs.rmSync('./public' + user.avatarURL, { force: true });
        return user;
      });
  }
}
