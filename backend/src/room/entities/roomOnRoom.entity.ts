import { ApiProperty } from '@nestjs/swagger';
import { UserOnRoom } from '@prisma/client';

export class UserOnRoomEntity implements UserOnroom {
  constructor(partial: Partial<UserOnRoomEntity>) {
    Object.assign(this, partial);
  }
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  ownerId: number;
}
