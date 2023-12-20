import { User } from '@prisma/client';

export class MessageEntity {
  constructor(partial: Partial<MessageEntity>, user: User) {
    Object.assign(this, partial);
    this.user = user;
  }
  content: string;
  roomId: number;
  user: User;
}
