import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class EnterRoomDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  password?: string;
}
