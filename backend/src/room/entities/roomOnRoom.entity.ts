import { ApiProperty } from '@nestjs/swagger';
import { UserOnRoom } from '@prisma/client';

export class UserOnRoomEntity implements UserOnRoom {
  constructor(partial: Partial<UserOnRoomEntity>) {
    Object.assign(this, partial);
  }
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  role: string;

  @ApiProperty()
  roomId: number;
}
