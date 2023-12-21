import * as fs from 'fs';
import * as request from 'supertest';

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
    role: expect.any(String),
    roomId: expect.any(Number),
    userId: expect.any(Number),
  };
  expect(userOnRoom).toEqual(expected);
};

export const expectUserOnRoomWithUser = (userOnRoom) => {
  const expected = {
    role: expect.any(String),
    roomId: expect.any(Number),
    userId: expect.any(Number),
    user: expect.any(Object),
  };
  expect(userOnRoom).toEqual(expected);
  expectPublicUser(userOnRoom.user);
};

export const expectUser = (user: any) => {
  const { avatarURL, ...rest } = user;
  expect([null, expect.any(String)]).toContain(avatarURL);
  const expected = {
    id: expect.any(Number),
    email: expect.any(String),
    name: expect.any(String),
    twoFactorEnabled: expect.any(Boolean),
    // avatarURL: expect., // string | null
  };
  expect(rest).toEqual(expected);
};

export const expectPublicUser = (user: any) => {
  const { avatarURL, ...rest } = user;
  expect([null, expect.any(String)]).toContain(avatarURL);
  const expected = {
    id: expect.any(Number),
    name: expect.any(String),
    // avatarURL: expect.anything(), // string | null
  };
  expect(rest).toEqual(expected);
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
