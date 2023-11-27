import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserOnRoomDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  role: Role;
}
