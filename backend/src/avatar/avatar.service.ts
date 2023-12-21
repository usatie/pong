import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from 'src/prisma/prisma.service';

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
    let user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const avatarURL = user.avatarURL;
    user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarURL: null },
    });
    if (!avatarURL) return user;
    try {
      fs.rmSync(path.join('./public', avatarURL), { force: true });
    } catch (error) {
      console.error(error);
    }
    return user;
  }
}
