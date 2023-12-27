import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  accessLevel: 'PUBLIC' | 'PRIVATE' | 'PROTECTED' | 'DIRECT';

  @ValidateIf((o) => o.accessLevel === 'PROTECTED')
  @IsString()
  @MinLength(4)
  @ApiProperty({ required: false })
  password?: string;

  @IsNumber({}, { each: true })
  @IsArray()
  @ApiProperty()
  userIds: number[];
}
