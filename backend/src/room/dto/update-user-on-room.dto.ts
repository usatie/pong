import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserOnRoomDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  role: Role;
}
