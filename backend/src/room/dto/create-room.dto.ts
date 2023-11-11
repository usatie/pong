import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty()
  id: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;
}
