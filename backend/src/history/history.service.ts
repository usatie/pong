import { Injectable } from '@nestjs/common';
import { CreateHistoryDto } from './dto/create-history.dto';

@Injectable()
export class HistoryService {
  create(userId: number, createHistoryDto: CreateHistoryDto) {
    return 'This action adds a new history';
  }

  findAll(userId: number) {
    return `This action returns all history`;
  }
}
