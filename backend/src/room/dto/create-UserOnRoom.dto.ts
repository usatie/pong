import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserOnRoomDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  role: Role;
}
