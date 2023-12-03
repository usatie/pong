import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDirectMessageDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  content: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  userName: string;

  @IsString()
  @ApiProperty({ required: false })
  conversationId?: string;

  @IsString()
  @ApiProperty({ required: false })
  from?: string;

  @IsString()
  @ApiProperty({ required: false })
  to?: string;
}
