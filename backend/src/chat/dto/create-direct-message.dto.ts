import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDirectMessageDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  content: string;

  @IsString()
  @ApiProperty()
  to: string;
}
