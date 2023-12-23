import { CreateRoomDto } from 'src/room/dto/create-room.dto';

export const publicRoom: CreateRoomDto = {
  name: 'public_room',
  accessLevel: 'PUBLIC',
};

export const privateRoom: CreateRoomDto = {
  name: 'private_room',
  accessLevel: 'PRIVATE',
};

export const protectedRoom: CreateRoomDto = {
  name: 'protected_room',
  accessLevel: 'PROTECTED',
  password: 'password',
};
