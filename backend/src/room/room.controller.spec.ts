import { Test, TestingModule } from '@nestjs/testing';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserController } from 'src/user/user.controller';
import { AuthController } from 'src/auth/auth.controller';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from 'src/auth/entity/auth.entity';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomEntity } from './entities/room.entity';
import { after } from 'node:test';
import { UserEntity } from 'src/user/entities/user.entity';
import { Role } from '@prisma/client';

interface testUser {
  name: string;
  email: string;
  password: string;
  id: number;
  accessToken: string;
  role: Role;
}

enum UserType {
  owner,
  admin,
  member,
}

describe('RoomController', () => {
  let controller: RoomController;
  let users: testUser[] = [
    {
      name: 'owner',
      email: 'owner@example.com',
      password: 'password-owner',
      id: <number>undefined,
      accessToken: undefined,
	  role: Role.OWNER,
    },
    {
      name: 'admin',
      email: 'admin@example.com',
      password: 'password-admin',
      id: <number>undefined,
      accessToken: undefined,
	  role: Role.ADMINISTRATOR,
    },
    {
      name: 'member',
      email: 'member@example.com',
      password: 'password-member',
      id: <number>undefined,
      accessToken: undefined,
	  role: Role.MEMBER,
    },
  ];

  let userController: UserController;

  const testRoom = {
    name: 'testRoom1',
    roomId: <number>undefined,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [RoomController, UserController, AuthController],
      providers: [
        RoomService,
        PrismaService,
        UserService,
        JwtService,
        AuthService,
      ],
    }).compile();

    controller = module.get<RoomController>(RoomController);
    userController = module.get<UserController>(UserController);
    const roomService: RoomService = module.get<RoomService>(RoomService);
    const authController: AuthController =
      module.get<AuthController>(AuthController);

    await users.forEach((user) => {
      userController
        .create(user)
        .then(async (UserEntity) => {
          user.id = UserEntity.id;
          if ((user.name = 'owner')) {
            testRoom.roomId = await roomService // controller で書きたいけど request の書き方が分からない
              .create(testRoom, users[UserType.owner])
              .then((roomEntity: RoomEntity) => {
                return roomEntity.id;
              });
          } else {
            roomService.createUserOnRoom(testRoom.roomId, user).then(() => {
              if ((user.name = 'admin'))
                roomService.updateUserOnRoom(
                  testRoom.roomId,
                  users[UserType.owner],
                  user.id,
                  { role: Role.ADMINISTRATOR },
                );
            });
          }
        })
        .catch((err) => {
          throw err;
        });
    });

    testRoom.roomId = await roomService // controller で書きたいけど request の書き方が分からない
      .create(testRoom, users[UserType.owner])
      .then((roomEntity: RoomEntity) => {
        return roomEntity.id;
      });
  });

  afterEach(async () => {
    try {
      await controller.removeRoom(testRoom.roomId);
      await userController.remove(users[UserType.owner].id);
    } catch (error) {
      throw error;
    }
  });

  it('would be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('/room/:id/:userId (GET)', () => {});

  describe('/room/:id/:userId (PATCH)', () => {});

  describe('/room/:id/:userId (DELETE)', () => {});
});
