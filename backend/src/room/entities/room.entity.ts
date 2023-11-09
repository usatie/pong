import { Room } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class RoomEntity implements Room {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}
