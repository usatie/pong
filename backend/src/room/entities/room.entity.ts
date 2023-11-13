import { Room } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class RoomEntity implements Room {
  constructor(partial: Partial<RoomEntity>) {
    Object.assign(this, partial);
  }
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  ownerId: number;
}
