import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class UserOnRoomDto {
	@IsNumber()
	id: number;

	@IsNumber()
	userid: number;

	@IsString()
	@IsNotEmpty()
	role: string;

	@IsNumber()
	roomid: number;

}
