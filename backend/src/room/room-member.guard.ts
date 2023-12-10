import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { RoomService } from './room.service';
import { Role } from '@prisma/client';

interface User {
  id: number;
  name: string;
}

@Injectable()
export class RoomRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private roomService: RoomService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): Promise<boolean> | boolean | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request['user'];
    const roomId = request.params.id;
    return this.getUserRole(user, roomId)
      .then((userRole) => {
        request['userRole'] = userRole;
        return true;
      })
      .catch(() => {
        return false;
      });
  }

  private getUserRole(user: User, roomId: string): Promise<Role> {
    return this.roomService
      .findUserOnRoom(Number(roomId), user.id)
      .then((userOnRoomEntity) => userOnRoomEntity.role)
      .catch(() => Promise.reject());
  }

  private meetRequirement(need: Role, userRole: Role): boolean {
    return this.roleToNum(userRole) >= this.roleToNum(need);
  }

  private roleToNum(role: Role): number {
    switch (role) {
      case Role.MEMBER:
        return 0;
      case Role.ADMINISTRATOR:
        return 1;
      case Role.OWNER:
        return 2;
    }
  }
}
