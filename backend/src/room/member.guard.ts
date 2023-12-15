import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RoomService } from './room.service';
import { Role } from '@prisma/client';

interface User {
  id: number;
  name: string;
}

@Injectable()
export class MemberGuard implements CanActivate {
  constructor(private roomService: RoomService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const { params, user } = req;
    const { id: roomId } = params;
    if (!roomId) {
      console.log('MemberGuard should only be used on routes with a roomId');
      throw new Error(
        'MemberGuard should only be used on routes with a roomId',
      );
    }
    if (typeof roomId !== 'string' || !/^\d+$/.test(roomId)) {
      console.log('roomId is not a valid integer');
      throw new BadRequestException('roomId parameter must be a valid integer');
    }
    try {
      const userOnRoom = await this.roomService.findUserOnRoom(
        Number(roomId),
        user.id,
      );
      req.role = userOnRoom.role;
    } catch (e) {
      throw new ForbiddenException('You are not a member of this room');
    }
    return true;
  }
}
