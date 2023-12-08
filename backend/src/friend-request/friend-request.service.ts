import { Injectable } from '@nestjs/common';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';

@Injectable()
export class FriendRequestService {
  create(createFriendRequestDto: CreateFriendRequestDto) {
    return 'This action adds a new friendRequest';
  }

  findAll() {
    return `This action returns all friendRequest`;
  }

  findOne(id: number) {
    return `This action returns a #${id} friendRequest`;
  }

  accept(id: number) {
    return `This action updates a #${id} friendRequest`;
  }

  reject(id: number) {
    return `This action updates a #${id} friendRequest`;
  }

  remove(id: number) {
    return `This action removes a #${id} friendRequest`;
  }
}
