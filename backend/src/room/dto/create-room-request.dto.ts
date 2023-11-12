// import { CreateRoomDto } from './create-room.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Room } from '@prisma/client';
import { CreateRoomDto } from './create-room.dto';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

// export type CreateRoomRequestDto = Omit<CreateRoomDto, 'ownerId'>;

export class CreateRoomRequestDto {
	@IsString()
	@ApiProperty()
	name: string;
}
