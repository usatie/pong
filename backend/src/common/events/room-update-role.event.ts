import { Role } from '@prisma/client';

export class RoomUpdateRoleEvent {
  roomId: number;
  userId: number;
  role: Role;
}
