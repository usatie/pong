export class RoomDeletedEvent {
  roomId: number;
  userIds: number[];
  accessLevel: 'PUBLIC' | 'PRIVATE' | 'PROTECTED' | 'DIRECT';
}
