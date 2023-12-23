export type GetRoomResponse = {
  id: number;
  name: string;
  users: UserOnRoom[];
};

export type UserOnRoom = {
  userId: number;
  role: string;
  roomId: number;
  user: {
    id: number;
    name: string;
    avatarURL?: string;
  };
};

export type PublicUserEntity = {
  id: number;
  name: string;
  avatarURL?: string;
};

export type FriendRequestsEntity = {
  requestedBy: PublicUserEntity[];
  requesting: PublicUserEntity[];
};

export type MatchDetailEntity = {
  score: number;
  winLose: "WIN" | "LOSE";
  user: PublicUserEntity;
};

export type MatchHistoryEntity = {
  id: number;
  players: MatchDetailEntity[];
  result: "COMPLETE" | "INCOMPLETE";
  createdAt: string;
};

export type UserEntity = {
  id: number;
  name: string;
  email: string;
  avatarURL?: string;
  twoFactorEnabled: boolean;
};
