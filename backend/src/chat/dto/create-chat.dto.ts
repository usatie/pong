import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
//import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChatDto {
  @IsNotEmpty()
  @ApiProperty()
  userOneId: string;

  @IsNotEmpty()
  @ApiProperty()
  userTwoId: string;
}
