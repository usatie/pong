import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsString,
  } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty()
  id: number;

  @IsString()
  @ApiProperty()
  name: string;
}
