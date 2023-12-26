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
    const { params, user, admin } = req;
    if (!user) {
      throw new ForbiddenException('Login is required');
    }
    if (!admin) {
      throw new ForbiddenException('Admin privileges are required');
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

    // Owner cannot be kicked
    if (targetRole === Role.OWNER) {
      throw new ForbiddenException('Cannot kick owners');
    }

    // Otherwise, admin/owner kicking someone else, that's ok
    return true;
  }
}
