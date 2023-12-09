import { Injectable } from '@nestjs/common';
import { CreateAvatarDto } from './dto/create-avatar.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';

@Injectable()
export class AvatarService {
  create(createAvatarDto: CreateAvatarDto) {
    return `This action adds a new avatar ${createAvatarDto}`;
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
