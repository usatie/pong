import { User } from '@prisma/client';

export class PublicUserEntity {
  constructor(partial: Partial<PublicUserEntity>) {
    this.id = partial.id;
    this.name = partial.name;
    this.avatarURL = partial.avatarURL;
  }
  id: number;
  name: string;
  avatarURL?: string;
}

export class MessageEntity {
  constructor(partial: Partial<MessageEntity>, user: PublicUserEntity) {
    this.content = partial.content;
    this.roomId = partial.roomId;
    this.user = user;
  }
  content: string;
  roomId: number;
  user: PublicUserEntity;
}
