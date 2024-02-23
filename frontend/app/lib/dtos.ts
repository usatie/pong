export type AccessLevel = "PUBLIC" | "PRIVATE" | "PROTECTED" | "DIRECT";

export type GetRoomResponse = {
  id: number;
  name: string;
  accessLevel: AccessLevel;
  users: UserOnRoomEntity[];
};

export type UserOnRoomEntity = {
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

export type JwtPayload = {
  userId: number;
  isTwoFactorEnabled: boolean;
  isTwoFactorAuthenticated: boolean;
};

export type DeleteRoomEvent = {
  roomId: number;
};

export type EnterRoomEvent = {
  roomId: number;
  userId: number;
};

export type LeaveRoomEvent = {
  roomId: number;
  userId: number;
};

export type MessageEvent = {
  user: PublicUserEntity;
  content: string;
  roomId: number;
};

export type RequestMatchEvent = {
  userId: number;
};

export type ApprovedMatchRequestEvent = {
  roomId: string;
};

export type DenyEvent = {};

export type RoomEntity = { id: number; name: string; accessLevel: AccessLevel };
