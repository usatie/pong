import { Role } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import { HttpAdapterHost, Reflector } from '@nestjs/core';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { RoomEntity } from 'src/room/entities/room.entity';
import { UpdateRoomDto } from 'src/room/dto/update-room.dto';
import { UserOnRoomEntity } from 'src/room/entities/UserOnRoom.entity';
import { AuthEntity } from 'src/auth/entity/auth.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const testUser = {
    name: 'test_user',
    email: 'test@test.com',
    password: 'password-test',
  };
  const testUserLogin = { email: testUser.email, password: testUser.password };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true })); // enable validation
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    ); // enable serialization
    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
    await app.init();
  });

  describe('/ (GET)', () => {
    it('should return "Hello World!"', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('/user', () => {
    const testUserResponse = (user) => {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).not.toHaveProperty('password');
    };
    describe('Without authentiation', () => {
      it('GET /user should return users list', async () => {
        const res = await request(app.getHttpServer()).get('/user').expect(200);
        const users = res.body;
        expect(users).toBeInstanceOf(Array);
        expect(users.length).toBeGreaterThan(0);
        users.forEach(testUserResponse);
      });

      it('GET /user/:id should return 401 Unauthorized', () => {
        return request(app.getHttpServer()).get('/user/1').expect(401);
      });

      it('PATCH /user/:id should return 401 Unauthorized', () => {
        return request(app.getHttpServer()).patch('/user/1').expect(401);
      });

      it('DELETE /user/:id should return 401 Unauthorized', () => {
        return request(app.getHttpServer()).delete('/user/1').expect(401);
      });
    });

    describe('Invalid Sign up', () => {
      it('POST /user with invalid email should return 400 Bad Request', () => {
        const invalidUser = { ...testUser, email: 'invalid' };
        return request(app.getHttpServer())
          .post('/user')
          .send(invalidUser)
          .expect(400);
      });

      it('POST /user with too short name should return 400 Bad Request', () => {
        const invalidUser = { ...testUser, name: 'a' };
        return request(app.getHttpServer())
          .post('/user')
          .send(invalidUser)
          .expect(400);
      });

      it('POST /user with too short password should return 400 Bad Request', () => {
        const invalidUser = { ...testUser, password: 'short' };
        return request(app.getHttpServer())
          .post('/user')
          .send(invalidUser)
          .expect(400);
      });
    });

    describe('Invalid authentication', () => {
      it('POST /auth/login with invalid email should return 400 Bad Request', () => {
        const invalidLogin = { ...testUserLogin, email: 'invalid' };
        return request(app.getHttpServer())
          .post('/auth/login')
          .send(invalidLogin)
          .expect(400);
      });

      it('POST /auth/login with email not registered should return 404 Not Found', () => {
        const invalidLogin = {
          ...testUserLogin,
          email: 'nosuchuser@example.com',
        };
        return request(app.getHttpServer())
          .post('/auth/login')
          .send(invalidLogin)
          .expect(404);
      });

      it('POST /auth/login with invalid password should return 401 Unauthorized', () => {
        const invalidLogin = {
          email: 'susami@example.com',
          password: 'invalid',
        };
        return request(app.getHttpServer())
          .post('/auth/login')
          .send(invalidLogin)
          .expect(401);
      });
    });

    describe('Sign up, Log in and Delete', () => {
      it('[POST /user] => [POST /auth/login] => [DELETE /user/:id]', async () => {
        const id = await request(app.getHttpServer())
          .post('/user')
          .send(testUser)
          .expect(201)
          .then((res) => {
            const user = res.body;
            testUserResponse(res.body);
            return user.id;
          });

        const accessToken = await request(app.getHttpServer())
          .post('/auth/login')
          .send(testUserLogin)
          .expect(201)
          .then((res) => res.body.accessToken);

        return request(app.getHttpServer())
          .delete(`/user/${id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(204)
          .expect({});
      });
    });

    describe('With authentication', () => {
      let id: number;
      let accessToken: string;

      beforeAll(async () => {
        id = await request(app.getHttpServer())
          .post('/user')
          .send(testUser)
          .then((res) => res.body.id);

        accessToken = await request(app.getHttpServer())
          .post('/auth/login')
          .send(testUserLogin)
          .then((res) => res.body.accessToken);
      });

      afterAll(async () => {
        await request(app.getHttpServer())
          .delete(`/user/${id}`)
          .set('Authorization', `Bearer ${accessToken}`);
      });

      it('GET /user/:id should return the user', () => {
        const expectedUser = { ...testUser, id };
        delete expectedUser.password;
        return request(app.getHttpServer())
          .get(`/user/${id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)
          .expect(expectedUser);
      });

      it('PATCH /user/:id should update the user', () => {
        const updatedUser = {
          ...testUser,
          id,
          name: 'new_name',
        };
        delete updatedUser.password;
        return request(app.getHttpServer())
          .patch(`/user/${id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updatedUser)
          .expect(200)
          .expect(updatedUser);
      });

      it('DELETE /user/:id should delete the user', () => {
        return request(app.getHttpServer())
          .delete(`/user/${id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(204)
          .expect({});
      });
    });
  });
  describe('/room/:id', () => {
    const userDtos: CreateUserDto[] = [
      {
        name: 'OWNER',
        email: 'owner@example.com',
        password: 'password-owner',
      },
      {
        name: 'ADMINISTRATOR',
        email: 'admin@example.com',
        password: 'password-admin',
      },
      {
        name: 'MEMBER',
        email: 'member@example.com',
        password: 'password-member',
      },
      {
        name: 'NotMEMBER',
        email: 'NotMember@example.com',
        password: 'password-NotMember',
      },
    ];

    const createRoomDto: CreateRoomDto = {
      name: 'testRoom',
    };

    type UserWithToken = UserEntity & {
      accessToken: string;
    };

    type Member = UserWithToken & {
      role: Role;
    };

    type dtoWithToken = CreateUserDto & {
      accessToken: string;
    };

    type PayloadOfJWT = {
      userId;
      iat;
      exp;
    };

    const createRoom = (
      user: UserWithToken,
      createRoomDto: CreateRoomDto,
    ): Promise<RoomEntity> =>
      request(app.getHttpServer())
        .post('/room')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send(createRoomDto)
        .then((res) => {
          const expectedProps: (keyof RoomEntity)[] = ['id', 'name'];
          const isRoomEntity = expectedProps.every((prop) => prop in res.body);
          return isRoomEntity ? res.body : Promise.reject(res.body);
        });

    const enterRoom = (
      user: UserWithToken,
      room: RoomEntity,
    ): Promise<Member> =>
      request(app.getHttpServer())
        .post(`/room/${room.id}`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send()
        .then((res) => {
          const expectedProps: (keyof UserOnRoomEntity)[] = [
            'id',
            'role',
            'userId',
            'roomId',
          ];
          const isMember = expectedProps.every((prop) => prop in res.body);
          return isMember ? { ...res.body, ...user } : Promise.reject(res.body);
        });

    const payloadFromJWT = ({ accessToken }: { accessToken: string }) =>
      atob(accessToken.split('.')[1]);

    const getUserWithToken = (user: UserEntity): Promise<UserWithToken> => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(user)
        .then((res) => {
          const expectedProps: (keyof AuthEntity)[] = ['accessToken'];
          const isUserWithToken = expectedProps.every(
            (prop) => prop in res.body,
          );
          return isUserWithToken
            ? { ...res.body, ...user }
            : Promise.reject(res.body);
        });
    };

    const loginUser = (u: CreateUserDto): Promise<dtoWithToken> =>
      request(app.getHttpServer())
        .post('/auth/login')
        .send(u)
        .then((res) => ({
          ...u,
          ...res.body,
        }));
    const getRooms = (): Promise<RoomEntity[]> =>
      request(app.getHttpServer())
        .get(`/room`)
        .then((res) => res.body);

    const getRoom = (name: string) =>
      getRooms().then((rms) => rms.find((rm) => rm.name === name));

    const deleteRoom = (
      room: RoomEntity,
      { accessToken }: { accessToken: string },
    ) =>
      request(app.getHttpServer())
        .delete(`/room/${room.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .then((res) => res.body);

    const deleteUser = (u: dtoWithToken) => {
      const payload: PayloadOfJWT = JSON.parse(payloadFromJWT(u));
      return request(app.getHttpServer())
        .delete(`/user/${payload.userId}`)
        .set('Authorization', `Bearer ${u.accessToken}`)
        .then((res) => res.body);
    };

    const createUser = (dto: CreateUserDto): Promise<UserEntity> =>
      request(app.getHttpServer())
        .post('/user')
        .send(dto)
        .then((res) => {
          // UserEntity の型から特定のキー（この場合は 'password'）を除外するユーティリティ型
          type OmitKey<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

          // 'password' 以外の UserEntity のキーを取得する
          type UserEntityKeysWithoutPassword = keyof OmitKey<
            UserEntity,
            'password'
          >;

          // 'password' 以外のキーを配列として取得する
          const expectedProps: UserEntityKeysWithoutPassword[] = Object.keys(
            new UserEntity({ id: 0, name: '', email: '' }),
          ) as UserEntityKeysWithoutPassword[];
          console.log(expectedProps);
          const isUserEntity = expectedProps.every((prop) => prop in res.body);
          return isUserEntity ? res.body : Promise.reject(res.body);
        });
    const getUsers = () => {
      return request(app.getHttpServer())
        .get('/user')
        .then((res) => res.body);
    };

    beforeAll(async () => {
      let room;
      for (const dto of userDtos) {
        const user = await createUser(dto);
        const userWithToken = await getUserWithToken({ ...user, password: dto.password });
        if (user.name === 'OWNER') {
          room = await createRoom(userWithToken, createRoomDto);
        } else if (user.name === 'MEMBER' || user.name === "ADMINISTRATOR") {
          await enterRoom(userWithToken, room);
        }
      }
    });

    afterAll(async () => {
      const ownerUser = await loginUser(userDtos.find((c) => c.name === 'OWNER'));
      const rooms = await getRooms();
      for (const room of rooms) {
        await deleteRoom(room, ownerUser);
      }
      for (const dto of userDtos) {
        const user = await loginUser(dto);
        await deleteUser(user);
      }
    });

    describe('GET', () => {
      const testGet = (
        { accessToken }: { accessToken: string },
        status: number,
        rm: RoomEntity,
      ) =>
        request(app.getHttpServer())
          .get(`/room/${rm.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(status)
          .then((res) => {
            if (status / 100 === 2) {
              expect(res.body).toHaveProperty('id');
              expect(res.body).toHaveProperty('name');
              expect(res.body).toHaveProperty('users');
              expect(res.body.users).toBeInstanceOf(Array);
              expect(res.body.users.length).toBeGreaterThan(0);
              res.body.users.forEach((user) => {
                expect(user).toHaveProperty('id');
                expect(user).toHaveProperty('role');
                expect(user).toHaveProperty('roomId');
                expect(user).toHaveProperty('userId');
              });
            }
          });

      const memberFilter = (user: UserWithToken) =>
        user.name === 'MEMBER' ||
        user.name === 'ADMINISTRATOR' ||
        user.name === 'OWNER';

      it('from roomMember: should return the room 200 OK', async () => {
        const users = await Promise.all(userDtos.map((u) => loginUser(u)));
        const room = await getRoom(createRoomDto.name);
        const members = users.filter(memberFilter);

        for (const member of members) {
          await testGet(member, 200, room);
        }
        //return Promise.all(members.map((user) => testGet(user, 200, room)));
      });
      it('from notMember: should return 403 Forbidden', async () => {
        const room = await getRoom(createRoomDto.name);
        const notMember = await loginUser(userDtos.find((c) => c.name === 'NotMEMBER'));
        await testGet(notMember, 403, room);
      });
      it('from unAuthorized User: should return 401 Unauthorized', async () => {
        const room = await getRoom(createRoomDto.name);

        await testGet({ accessToken: '' }, 401, room);
      });
    });

    describe('POST', () => {
      const testPost = (
        { accessToken }: { accessToken: string },
        status: number,
        rm: RoomEntity,
      ) =>
        request(app.getHttpServer())
          .post(`/room/${rm.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(status);

      it('from member: should return 409 Conflict', async () => {
        const users = await Promise.all(userDtos.map((u) => loginUser(u)));
        const room = await getRoom(createRoomDto.name);
        const members = users.filter(
          (u) =>
            u.name === 'MEMBER' ||
            u.name === 'ADMINISTRATOR' ||
            u.name === 'OWNER',
        );

        return Promise.all(members.map((m) => testPost(m, 409, room)));
      });

      it('from notMember: should return 201 Created', async () => {
        const users = await Promise.all(userDtos.map((u) => loginUser(u)));
        const room = await getRoom(createRoomDto.name);
        const notMember = users.find((u) => u.name === 'NotMEMBER');

        return testPost(notMember, 201, room);
      });

      it('from unAuthorized User: should return 401 Unauthorized', async () => {
        const room = await getRoom(createRoomDto.name);

        return testPost({ accessToken: '' }, 401, room);
      });
    });

    describe('PATCH', () => {
      const testPatch = (
        { accessToken }: { accessToken: string },
        status: number,
        rm: RoomEntity,
        data: UpdateRoomDto,
      ) =>
        request(app.getHttpServer())
          .patch(`/room/${rm.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(data)
          .expect(status)
          .then((res) => {
            if (status < 300) expect(res.body.name).toEqual(data.name);
          });

      const newName = 'new_name';

      it('from Owner: should return 200 OK', async () => {
        const users = await Promise.all(userDtos.map((u) => loginUser(u)));
        const room = await getRoom(createRoomDto.name);
        const owner = users.find((u) => u.name === 'OWNER');

        return testPatch(owner, 200, room, { name: newName }).then(() =>
          testPatch(owner, 200, room, { name: createRoomDto.name }),
        );
      });
      it('from Member and Admin : should return 403', async () => {
        const users = await Promise.all(userDtos.map((u) => loginUser(u)));
        const room = await getRoom(createRoomDto.name);
        const members = users.filter(
          (u) => u.name === 'MEMBER' || u.name === 'ADMINISTRATOR',
        );

        return Promise.all(
          members.map((user) => testPatch(user, 403, room, { name: newName })),
        );
      });
      it('from notMember : should return 403 Forbidden', async () => {
        const users = await Promise.all(userDtos.map((u) => loginUser(u)));
        const room = await getRoom(createRoomDto.name);
        const notMembers = users.find((u) => u.name === 'NotMEMBER');

        return testPatch(notMembers, 403, room, { name: newName });
      });
      it('from unAuthorized User: should return 401 Unauthorized', async () => {
        const room = await getRoom(createRoomDto.name);

        return request(app.getHttpServer())
          .patch(`/room/${room.id}`)
          .send({ name: newName })
          .expect(401);
      });
    });

    describe('DELETE', () => {
      const testDelete = (
        { accessToken }: { accessToken: string },
        status: number,
        rm: RoomEntity,
      ) =>
        request(app.getHttpServer())
          .delete(`/room/${rm.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(status);

      it('from roomMember: Owner : should return 200 OK (to prepare test, this action is tried. To prevent room delete, don"t execute this test! take care!)', () => {
        return expect(true).toBe(true);
      });

      it('except Owner: should return 403 Forbidden', async () => {
        const users = await Promise.all(userDtos.map((u) => loginUser(u)));
        const room = await getRoom(createRoomDto.name);
        const membersExceptOwner = users.filter((u) => u.name !== 'OWNER');

        return Promise.all(
          membersExceptOwner.map((user) => testDelete(user, 403, room)),
        );
      });

      it('from unAuthorized User: should return 401 Unauthorized', async () => {
        const room = await getRoom(createRoomDto.name);

        return testDelete({ accessToken: '' }, 401, room);
      });
    });

    describe('PATCH /room/:id/:userId', () => {
      // const getUserIdFromJWT = ({ accessToken }: { accessToken: string }) =>
      //   JSON.parse(payloadFromJWT({ accessToken })).userId;
      // const updateUserRole = (
      //   changer: UserWithToken,
      //   changed: UserWithToken,
      //   { role }: { role: Role },
      //   room: RoomEntity,
      // ): Promise<Member> =>
      //   request(app.getHttpServer())
      //     .patch(`/room/${room.id}/${getUserIdFromJWT(changed)}`)
      //     .set('Authorization', `Bearer ${changer.accessToken}`)
      //     .send({ role })
      //     .then((res) => ({ ...changed, ...res.body }));
      // const getOneUserOnRoom = (
      //   room: RoomEntity,
      //   user: UserWithToken,
      // ): Promise<UserOnRoomEntity> =>
      //   request(app.getHttpServer())
      //     .get(`/room/${room.id}/${JSON.parse(payloadFromJWT(user)).userId}`)
      //     .set('Authorization', `Bearer ${user.accessToken}`)
      //     .send()
      //     .then((res) => res.body);
    });
  });
});
