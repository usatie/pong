import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateFriendRequestDto {
  @IsNumber()
  @ApiProperty()
  recipientId: number;
}
