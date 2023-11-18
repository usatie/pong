import { ApiProperty } from '@nestjs/swagger';
import { UserOnRoom, Role } from '@prisma/client';

export class UserOnRoomEntity implements UserOnRoom {
  constructor(partial: Partial<UserOnRoomEntity>) {
    Object.assign(this, partial);
  }
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  role: Role;

  @ApiProperty()
  roomId: number;
}
