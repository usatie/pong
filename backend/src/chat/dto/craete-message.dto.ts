import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  content: string;

  @IsNumber()
  @ApiProperty()
  roomId: number;

  @IsNumber()
  @ApiProperty()
  userId: number;
}
