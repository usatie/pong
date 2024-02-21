export class WsPublicUserEntity {
  constructor(user: WsPublicUserEntity) {
    this.id = user.id;
    this.name = user.name;
    this.avatarURL = user.avatarURL;
  }
  id: number;
  name: string;
  avatarURL: string | null;
}

export class MessageEntity {
  constructor(message: Omit<MessageEntity, 'user'>, user: WsPublicUserEntity) {
    this.content = message.content;
    this.roomId = message.roomId;
    this.user = user;
  }
  content: string;
  roomId: number;
  user: WsPublicUserEntity;
}
