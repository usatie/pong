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
export class KickGuard implements CanActivate {
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
    const { params, user, member } = req;
    const { roomId, userId: targetUserId } = params;
    // Validate roomId and targetUserId(userId)
    this.expectNumberParam(roomId, 'roomId');
    this.expectNumberParam(targetUserId, 'userId');

    // Check if targetUser is a member of the room
    const userOnRoom = await this.prisma.userOnRoom.findUniqueOrThrow({
      where: {
        userId_roomId_unique: {
          userId: Number(targetUserId),
          roomId: Number(roomId),
        },
      },
    });
    const targetRole = userOnRoom.role;

    // If anyone is trying to kick themself, that's ok
    if (Number(targetUserId) === user.id) {
      return true;
    }

    // If member is trying to kick someone else throw a ForbiddenException
    if (member.role === Role.MEMBER) {
      throw new ForbiddenException('Members cannot kick others');
    }

    // If admin is trying to kick owner, throw a ForbiddenException
    if (targetRole === Role.OWNER && member.role === Role.ADMINISTRATOR) {
      throw new ForbiddenException('Admins cannot kick owners');
    }

    // Otherwise, admin/owner kicking someone else, that's ok
    return true;
  }
}
