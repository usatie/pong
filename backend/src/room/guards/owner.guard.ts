import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  expectNumberParam(
    param: string | null | undefined,
    paramName: string,
  ): number {
    if (!param) {
      throw new BadRequestException(`${paramName} is required`);
    }
    if (!/^\d+$/.test(param)) {
      throw new BadRequestException(`${paramName} must be a number`);
    }
    return Number(param);
  }

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const { params, user } = req;
    const { roomId } = params;
    // Validate roomId and targetUserId(userId)
    this.expectNumberParam(roomId, 'roomId');

    // Check if targetUser is a member of the room
    let userOnRoom;
    try {
      userOnRoom = await this.prisma.userOnRoom.findUniqueOrThrow({
        where: {
          userId_roomId_unique: {
            userId: user.id,
            roomId: Number(roomId),
          },
        },
      });
    } catch (e) {
      throw new ForbiddenException('Only owner can do this');
    }

    // Check if user is the owner
    if (userOnRoom.role !== Role.OWNER) {
      throw new ForbiddenException('Only owner can do this');
    }
    req.member = userOnRoom;
    return true;
  }
}
