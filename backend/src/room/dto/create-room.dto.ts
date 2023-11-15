import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;
}
