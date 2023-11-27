import { PartialType } from '@nestjs/swagger';
import { CreateUserOnRoomDto } from './create-UserOnRoom.dto';

export class UpdateUserOnRoomDto extends PartialType(CreateUserOnRoomDto) {}
