export type Message = {
  user: User;
  content: string;
};

export type User = {
  id: number;
  name: string;
  avatarURL?: string;
};
