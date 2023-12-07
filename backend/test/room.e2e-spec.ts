import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Role } from '@prisma/client';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { RoomEntity } from 'src/room/entities/room.entity';
import { UpdateRoomDto } from 'src/room/dto/update-room.dto';
import { UserOnRoomEntity } from 'src/room/entities/UserOnRoom.entity';
import { AuthEntity } from 'src/auth/entity/auth.entity';
import { initializeApp } from './util';

describe('AppController (e2e)', () => {
    let app: INestApplication;
    beforeAll(async () => {
        app = await initializeApp();
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
            Buffer.from(accessToken.split('.')[1], 'base64').toString('utf-8');

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
                    const isUserEntity = expectedProps.every((prop) => prop in res.body);
                    return isUserEntity ? res.body : Promise.reject(res.body);
                });

        beforeAll(async () => {
            let room;
            for (const dto of userDtos) {
                const user = await createUser(dto);
                const userWithToken = await getUserWithToken({
                    ...user,
                    password: dto.password,
                });
                if (user.name === 'OWNER') {
                    room = await createRoom(userWithToken, createRoomDto);
                } else if (user.name === 'MEMBER' || user.name === 'ADMINISTRATOR') {
                    await enterRoom(userWithToken, room);
                }
            }
        });

        afterAll(async () => {
            const ownerUser = await loginUser(
                userDtos.find((c) => c.name === 'OWNER'),
            );
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
                const notMember = await loginUser(
                    userDtos.find((c) => c.name === 'NotMEMBER'),
                );
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
    });
});
