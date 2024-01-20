import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class CreateMuteDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  duration: number;
}
