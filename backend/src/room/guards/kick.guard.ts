import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
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
    if (!user || !member) {
      throw new ForbiddenException('require login and member');
    }
    // Validate roomId and targetUserId(userId)
    const roomId = this.expectNumberParam(params.roomId, 'roomId');
    const targetUserId = this.expectNumberParam(params.userId, 'userId');

    // Check if targetUser is a member of the room
    // If target user is not found, it's okay to return NotFoundException,
    // So I don't want to implement any try/catch here.
    const userOnRoom = await this.prisma.userOnRoom.findUniqueOrThrow({
      where: {
        userId_roomId_unique: {
          userId: targetUserId,
          roomId: roomId,
        },
      },
    });
    const targetRole = userOnRoom.role;

    // If anyone is trying to kick themself, that's ok
    if (targetUserId === user.id) {
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
