import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
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
    // Validate roomId and targetUserId(userId)
    const roomId = this.expectNumberParam(params.roomId, 'roomId');
    if (!user) {
      throw new ForbiddenException('require login');
    }

    // Check if user is a member of the room
    let userOnRoom;
    try {
      userOnRoom = await this.prisma.userOnRoom.findUniqueOrThrow({
        where: {
          userId_roomId_unique: {
            userId: user.id,
            roomId: roomId,
          },
        },
      });
    } catch (e) {
      // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
      const NOTFOUND = 'P2025';
      if (e instanceof PrismaClientKnownRequestError && e.code === NOTFOUND) {
        throw new ForbiddenException('User not found in the room');
      } else {
        throw e;
      }
    }

    // Check if user has admin role
    if (
      userOnRoom.role !== Role.OWNER &&
      userOnRoom.role !== Role.ADMINISTRATOR
    ) {
      throw new ForbiddenException('Only owner or administrator can do this');
    }
    req.admin = userOnRoom;
    return true;
  }
}
