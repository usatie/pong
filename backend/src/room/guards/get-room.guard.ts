import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoomService } from '../room.service';

@Injectable()
export class GetRoomGuard implements CanActivate {
  constructor(
    private roomService: RoomService,
    private prisma: PrismaService,
  ) {}

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
    const roomIdInt = Number(roomId);
    // 404 if room does not exist
    // 404 if user is banned from the room
    const room = await this.prisma.room.findUniqueOrThrow({
      where: { id: roomIdInt, BannedUsers: { none: { userId: user.id } } },
    });
    switch (room.accessLevel) {
      case 'PUBLIC':
      case 'PROTECTED':
        return true;
      case 'PRIVATE':
      case 'DIRECT':
        // 404 if user is not a member of the room
        const userOnRoom = await this.roomService.findUserOnRoom(
          roomIdInt,
          user.id,
        );
        return !!userOnRoom;
      default:
        throw new BadRequestException('Invalid accessLevel');
    }
  }
}
