import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateMuteDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  duration: number;
}
