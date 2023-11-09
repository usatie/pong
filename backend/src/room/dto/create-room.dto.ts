import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}
