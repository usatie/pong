import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UpdateRoomDto } from '../dto/update-room.dto';
import { RoomService } from '../room.service';

@Injectable()
export class UpdateRoomGuard implements CanActivate {
  constructor(private roomService: RoomService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const { params, user } = req;
    if (!user) {
      throw new ForbiddenException('require login');
    }
    const { roomId } = params;
    if (!roomId) {
      throw new Error('UpdateRoomGuard should only be used with :roomId');
    }
    if (typeof roomId !== 'string' || !/^\d+$/.test(roomId)) {
      throw new BadRequestException('roomId parameter must be a valid integer');
    }
    const room = await this.roomService.findRoom(Number(roomId));
    const dto: UpdateRoomDto = req.body;
    switch (room.accessLevel) {
      case 'PUBLIC':
      case 'PRIVATE':
        switch (dto.accessLevel) {
          case 'PUBLIC':
          case 'PRIVATE':
          case undefined:
            if (dto.password) {
              throw new BadRequestException(
                'cannot set password for PUBLIC/PRIVATE room',
              );
            }
            return true;
          case 'PROTECTED':
            if (!dto.password) {
              throw new BadRequestException('password is required');
            }
            return true;
          case 'DIRECT':
            throw new BadRequestException('cannot update to DIRECT');
          default:
            throw new BadRequestException('unreachable');
        }
      case 'PROTECTED':
        switch (dto.accessLevel) {
          case 'PUBLIC':
          case 'PRIVATE':
            if (dto.password) {
              throw new BadRequestException(
                'cannot set password for PUBLIC/PRIVATE room',
              );
            }
            return true;
          case 'PROTECTED':
          case undefined:
            if (dto.password === null || dto.password === '') {
              throw new BadRequestException('password cannot be empty');
            }
            return true;
          case 'DIRECT':
            throw new BadRequestException('cannot update to DIRECT');
          default:
            throw new BadRequestException('unreachable');
        }
      case 'DIRECT':
        throw new BadRequestException('cannot update DIRECT room');
      default:
        throw new BadRequestException('unreachable');
    }
  }
}
