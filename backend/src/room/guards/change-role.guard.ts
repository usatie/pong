import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserOnRoomDto } from '../dto/update-UserOnRoom.dto';

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
    const { params, member } = req;
    if (!member) {
      throw new ForbiddenException('require member');
    }
    // Validate roomId and targetUserId(userId)
    const roomId = this.expectNumberParam(params.roomId, 'roomId');
    const targetUserId = this.expectNumberParam(params.userId, 'userId');

    // Check if targetUser is a member of the room
    const userOnRoom = await this.prisma.userOnRoom.findUniqueOrThrow({
      where: {
        userId_roomId_unique: {
          userId: targetUserId,
          roomId: roomId,
        },
      },
    });
    const targetRole = userOnRoom.role;

    // If member is trying to change someone else's role throw a ForbiddenException
    if (member.role === Role.MEMBER) {
      throw new ForbiddenException('Members cannot change the role of others');
    }

    // If admin is trying to kick owner, throw a ForbiddenException
    if (targetRole === Role.OWNER && member.role === Role.ADMINISTRATOR) {
      throw new ForbiddenException('Admins cannot change the role of owner');
    }

    // Cannot change the role to be owner
    // Ownership should be transferred by owner
    const dto: UpdateUserOnRoomDto = req.body;
    if (dto.role === Role.OWNER) {
      throw new ForbiddenException('Anyone cannot change the role to be owner');
    }

    // Otherwise, admin/owner kicking someone else, that's ok
    return true;
  }
}
