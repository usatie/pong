import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RoomService } from '../room.service';

@Injectable()
export class GetRoomGuard implements CanActivate {
  constructor(private roomService: RoomService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const { params, user } = req;
    if (!user) {
      throw new ForbiddenException('require login');
    }
    const { roomId } = params;
    if (!roomId) {
      throw new Error('GetRoomGuard should only be used with :roomId');
    }
    if (typeof roomId !== 'string' || !/^\d+$/.test(roomId)) {
      throw new BadRequestException('roomId parameter must be a valid integer');
    }
    const room = await this.roomService.findRoom(Number(roomId));
    // PUBLIC/PROTECTED rooms are accessible to everyone
    if (room.accessLevel === 'PUBLIC' || room.accessLevel === 'PROTECTED') {
      return true;
    }
    // PRIVATE rooms are only accessible to members
    try {
      await this.roomService.findUserOnRoom(Number(roomId), user.id);
      return true;
    } catch (e) {
      if (e.code === 'P2025') {
        // If userOnRoom is not found, throw a ForbiddenException
        throw new ForbiddenException('You are not a member of this room');
      } else {
        // Otherwise, throw the error
        throw e;
      }
    }
  }
}
