import { CreateRoomDto } from 'src/room/dto/create-room.dto';

export const publicRoom: CreateRoomDto = {
  name: 'public_room',
  accessLevel: 'PUBLIC',
  userIds: [],
};

export const privateRoom: CreateRoomDto = {
  name: 'private_room',
  accessLevel: 'PRIVATE',
  userIds: [],
};

export const protectedRoom: CreateRoomDto = {
  name: 'protected_room',
  accessLevel: 'PROTECTED',
  password: 'password',
  userIds: [],
};

export const directRoom: CreateRoomDto = {
  name: 'direct_room',
  accessLevel: 'DIRECT',
  userIds: [],
};
