import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { RoomService } from './room.service';

@Injectable()
export class MemberGuard implements CanActivate {
  constructor(private roomService: RoomService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const { params, user } = req;
    const { roomId } = params;
    if (!roomId) {
      throw new Error('MemberGuard should only be used with :roomId');
    }
    if (typeof roomId !== 'string' || !/^\d+$/.test(roomId)) {
      throw new BadRequestException('roomId parameter must be a valid integer');
    }
    try {
      const userOnRoom = await this.roomService.findUserOnRoom(
        Number(roomId),
        user.id,
      );
      req.member = userOnRoom;
    } catch (e) {
      throw new ForbiddenException('You are not a member of this room');
    }
    return true;
  }
}
