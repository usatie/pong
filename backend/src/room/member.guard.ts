import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RoomService } from './room.service';
import { Role } from '@prisma/client';

interface User {
  id: number;
  name: string;
}

@Injectable()
export class MemberGuard implements CanActivate {
  constructor(private roomService: RoomService) {}

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
}
