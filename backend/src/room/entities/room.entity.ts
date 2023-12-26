import { ApiProperty } from '@nestjs/swagger';
import { Room } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class RoomEntity implements Room {
  constructor(partial: Partial<RoomEntity>) {
    Object.assign(this, partial);
  }
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  accessLevel: 'PUBLIC' | 'PRIVATE' | 'PROTECTED';

  @Exclude()
  password: string;
}
