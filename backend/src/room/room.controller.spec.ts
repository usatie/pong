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
import { CreateUserDto } from 'src/user/dto/create-user.dto';

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
  let roomService: RoomService;

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
    const userService: UserService = module.get<UserService>(UserService);
    roomService = module.get<RoomService>(RoomService);
    const authController: AuthController =
      module.get<AuthController>(AuthController);

    // create user
    const userCreationPromises = users.map(user => {
      const createUserDto: CreateUserDto = {
        name: user.name,
        email: user.email,
        password: user.password,
      };
      // ここで非同期処理を行う
      return userService.create(createUserDto)
        .then(userEntity => {
          user.id = userEntity.id;
          console.log('user.id: ' + user.id);
        })
        .catch(err => {
          // エラー処理
          console.error(err);
          throw err;
        });
    });

    return Promise.all(userCreationPromises).then(() => {
      console.log('userCreationPromises done');
      const user = {id: users[UserType.owner].id, name: users[UserType.owner].name};
      console.log(user);
      return roomService // controller で書きたいけど request の書き方が分からない
        .create(testRoom, user)
    }).then((roomEntity: RoomEntity) => {
      testRoom.roomId = roomEntity.id;
      console.log(testRoom);
    }).catch((err) => {
      throw err;
    });
    // .then(() => {
    //   return users.map((user) => {
    //     return authController
    //       .login(user)
    //       .then((authEntity: AuthEntity) => {
    //         user.accessToken = authEntity.accessToken;
    //       })
    //       .catch((err) => {
    //         throw err;
    //       });
    //   });
    // }).catch((err) => {
    //   throw err;
    // }).then(() => {
    //   console.log(users);
    // });


    // enter room

    // await roomService.createUserOnRoom(testRoom.roomId, users[UserType.admin]).then(() => {
    //   roomService.updateUserOnRoom(
    //     testRoom.roomId,
    //     users[UserType.owner],
    //     users[UserType.admin].id,
    //     { role: Role.ADMINISTRATOR },
    //   );
    // });
    // await roomService.createUserOnRoom(testRoom.roomId, users[UserType.member]);
    
    // Promise.all(
    //   users.map((user) => {
    //     return authController
    //       .login(user)
    //       .then((authEntity: AuthEntity) => {
    //         user.accessToken = authEntity.accessToken;
    //       })
    //       .catch((err) => {
    //         throw err;
    //       });
    //   }),
    // ).then(() => {
    //   console.log(users);
    // }).catch((err) => {
    //   throw err;
    // });
  });

  afterEach(async () => {
    try {
      console.log('afterEach', testRoom);
      await controller.removeRoom(testRoom.roomId);
      for (const user of users) {
        await userController.remove(user.id);
      }
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
