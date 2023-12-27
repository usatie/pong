import { Injectable } from '@nestjs/common';
import { CreateBanDto } from './dto/create-ban.dto';
import { UpdateBanDto } from './dto/update-ban.dto';

@Injectable()
export class BanService {
  create(createBanDto: CreateBanDto) {
    return 'This action adds a new ban';
  }

  findAll() {
    return `This action returns all ban`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ban`;
  }

  update(id: number, updateBanDto: UpdateBanDto) {
    return `This action updates a #${id} ban`;
  }

  remove(id: number) {
    return `This action removes a #${id} ban`;
  }
}
