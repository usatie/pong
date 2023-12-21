import { ApiProperty } from '@nestjs/swagger';
import { Role, UserOnRoom } from '@prisma/client';

export class UserOnRoomEntity implements UserOnRoom {
  constructor(partial: Partial<UserOnRoomEntity>) {
    Object.assign(this, partial);
  }
  @ApiProperty({ example: 1, description: 'The unique identifier of the user' })
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  role: Role;

  @ApiProperty()
  roomId: number;
}
