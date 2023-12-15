import { Injectable } from '@nestjs/common';
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

  async remove(userId: number) {
    // To remove avatar file, we need to know the original avatarURL
    const avatarURL = await this.prisma.user
      .findUniqueOrThrow({
        where: { id: userId },
      })
      .then((user) => user.avatarURL);
    return this.prisma.user
      .update({
        where: { id: userId },
        data: { avatarURL: null },
      })
      .then((user) => {
        if (!avatarURL) return user;
        fs.rmSync('./public' + avatarURL, { force: true });
        return user;
      });
  }
}
