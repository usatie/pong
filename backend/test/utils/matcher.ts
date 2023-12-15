import * as request from 'supertest';
import * as fs from 'fs';

export const expectRoomWithUsers = (room) => {
  const expected = {
    id: expect.any(Number),
    name: expect.any(String),
    users: expect.any(Array),
  };
  expect(room).toEqual(expected);
};

export const expectRoom = (room) => {
  const expected = {
    id: expect.any(Number),
    name: expect.any(String),
  };
  expect(room).toEqual(expected);
};

export const expectUserOnRoom = (userOnRoom) => {
  const expected = {
    id: expect.any(Number),
    role: expect.any(String),
    roomId: expect.any(Number),
    userId: expect.any(Number),
  };
  expect(userOnRoom).toEqual(expected);
};

export const expectUser = (user: any) => {
  const expected = {
    id: expect.any(Number),
    email: expect.any(String),
    name: expect.any(String),
    twoFactorEnabled: expect.any(Boolean),
    avatarURL: expect.any(String),
  };
  // TODO: Remove this try-catch
  // How can I set avatarURL "any string or null"?
  try {
    expect(user).toEqual(expected);
  } catch {
    expected.avatarURL = null;
    expect(user).toEqual(expected);
  }
};

export const expectPublicUser = (user: any) => {
  const expected = {
    id: expect.any(Number),
    name: expect.any(String),
    avatarURL: expect.any(String),
  };
  try {
    expect(user).toEqual(expected);
  } catch {
    expected.avatarURL = null;
    expect(user).toEqual(expected);
  }
};

export const expectPlayerObject = (player: any) => {
  const expected = {
    score: expect.any(Number),
    winLose: expect.any(String),
    user: expect.any(Object),
  };
  expect(player).toEqual(expected);
  expectPublicUser(player.user);
};

export const expectHistoryObject = (history: any) => {
  const expected = {
    id: expect.any(Number),
    players: expect.any(Array),
    result: expect.any(String),
    createdAt: expect.any(String),
  };
  expect(history).toEqual(expected);
  history.players.forEach(expectPlayerObject);
};

export const expectHistoryResponse = (res: request.Response) => {
  expect(res.body).toBeInstanceOf(Array);
  res.body.forEach(expectHistoryObject);
};

export function expectFile(filepath: string) {
  return (res: request.Response) => {
    const expected = fs.readFileSync(filepath);
    expect(res.body).toEqual(expected);
  };
}
