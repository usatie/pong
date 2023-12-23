import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  accessLevel: 'PUBLIC' | 'PRIVATE' | 'PROTECTED';

  @IsString()
  @MinLength(4)
  @IsOptional()
  @ApiProperty({ required: false })
  password?: string;
}
