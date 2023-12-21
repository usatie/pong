import { ApiProperty } from '@nestjs/swagger';
import { Role, UserOnRoom } from '@prisma/client';

export class UserOnRoomEntity implements UserOnRoom {
  constructor(partial: Partial<UserOnRoomEntity>) {
    Object.assign(this, partial);
  }
  @ApiProperty()
  userId: number;

  @ApiProperty()
  role: Role;

  @ApiProperty()
  roomId: number;
}
