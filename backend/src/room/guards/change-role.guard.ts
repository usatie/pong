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
export class ChangeRoleGuard implements CanActivate {
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
    const { params, admin } = req;
    if (!admin) {
      throw new ForbiddenException('Admin privileges are required');
    }
    // Validate roomId and targetUserId(userId)
    const roomId = this.expectNumberParam(params.roomId, 'roomId');
    const targetUserId = this.expectNumberParam(params.userId, 'userId');

    // Check if targetUser is a member of the room
    const target = await this.prisma.userOnRoom.findUniqueOrThrow({
      where: {
        userId_roomId_unique: {
          userId: targetUserId,
          roomId: roomId,
        },
      },
    });

    // If changing owner's role, throw a ForbiddenException
    if (target.role === Role.OWNER) {
      throw new ForbiddenException("Cannot change owner's role");
    }

    // Cannot change the role to be owner (Ownership should be transferred instead)
    if (req.body.role === Role.OWNER) {
      throw new ForbiddenException('Cannot change role to be owner');
    }

    // Otherwise, admin/owner kicking someone else, that's ok
    return true;
  }
}
