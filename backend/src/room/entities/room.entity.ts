import { Room } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class RoomEntity implements Room {
  constructor(partial: Partial<RoomEntity>) {
    Object.assign(this, partial);
  }
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}
