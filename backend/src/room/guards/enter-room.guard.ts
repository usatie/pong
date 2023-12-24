import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RoomService } from '../room.service';

@Injectable()
export class EnterRoomGuard implements CanActivate {
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
    switch (room.accessLevel) {
      case 'PUBLIC': // PUBLIC rooms are accessible to everyone
        return true;
      case 'PROTECTED': // PROTECTED rooms are accessible to everyone with a password
        if (!req.body.password) {
          throw new BadRequestException('password is required');
        }
        if (room.password !== req.body.password) {
          throw new ForbiddenException('invalid password');
        }
        return true;
      case 'PRIVATE': // PRIVATE rooms are invite only
        return false;
    }
  }
}
