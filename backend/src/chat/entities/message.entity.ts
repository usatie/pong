import { User } from '@prisma/client';

export class PrivateUserEntity {
  constructor(partial: Partial<PrivateUserEntity>) {
    this.id = partial.id;
    this.name = partial.name;
    this.avatarURL = partial.avatarURL;
  }
  id: number;
  name: string;
  avatarURL?: string;
}

export class MessageEntity {
  constructor(partial: Partial<MessageEntity>, user: User) {
    this.content = partial.content;
    this.roomId = partial.roomId;
    this.user = new PrivateUserEntity(user);
  }
  content: string;
  roomId: number;
  user: PrivateUserEntity;
}
