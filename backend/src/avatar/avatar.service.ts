import { Injectable } from '@nestjs/common';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AvatarService {
  constructor(private prisma: PrismaService) {}

  create(userId: number, file: Express.Multer.File) {
    //return `This action adds a new avatar ${file}`;
    const avatarURL = `/avatar/${file.filename}`;
    return this.prisma.user
      .update({
        where: { id: userId },
        data: { avatarURL },
      })
      .then(() => {
        return { filename: file.filename, url: avatarURL };
      });
  }

  update(updateAvatarDto: UpdateAvatarDto) {
    return `This action updates a #${updateAvatarDto} avatar`;
  }

  findOne(filename: string) {
    return `This action returns a #${filename} avatar`;
  }

  remove(id: number) {
    return `This action removes a #${id} avatar`;
  }
}
