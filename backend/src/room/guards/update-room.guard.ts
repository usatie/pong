import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RoomService } from '../room.service';
import { UpdateRoomDto } from '../dto/update-room.dto';

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
    // Remove password from PROTECTED by changing accessLevel to PUBLIC/PRIVATE is ok
    if (
      room.accessLevel === 'PROTECTED' &&
      dto.accessLevel !== 'PROTECTED' &&
      !dto.password
    ) {
      return true;
    }

    const updated = { ...room, ...dto };
    // non-PROTECTED room must not have password
    if (updated.accessLevel !== 'PROTECTED' && updated.password) {
      throw new BadRequestException(
        'password is only allowed for PROTECTED rooms',
      );
    }
    // PROTECTED room must have password
    if (updated.accessLevel === 'PROTECTED' && !updated.password) {
      throw new BadRequestException('password is required');
    }
    return true;
  }
}
