export const expectUser = (user) => {
  expect(user).toHaveProperty('id');
  expect(user).toHaveProperty('name');
  expect(user).toHaveProperty('email');
  expect(user).not.toHaveProperty('password');
};

export const expectRoomWithUsers = (room) => {
  expect(room).toHaveProperty('id');
  expect(room).toHaveProperty('name');
  expect(room).toHaveProperty('users');
};

export const expectRoom = (room) => {
  expect(room).toHaveProperty('id');
  expect(room).toHaveProperty('name');
};

export const expectUserOnRoom = (userOnRoom) => {
  expect(userOnRoom).toHaveProperty('id');
  expect(userOnRoom).toHaveProperty('role');
  expect(userOnRoom).toHaveProperty('roomId');
  expect(userOnRoom).toHaveProperty('userId');
};
