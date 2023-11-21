import { Test, TestingModule } from '@nestjs/testing';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserController } from 'src/user/user.controller';
import { AuthController } from 'src/auth/auth.controller';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from 'src/auth/entity/auth.entity';

describe('RoomController', () => {
  let controller: RoomController;
  const testUser = {
    name: 'room_controller_spec',
    email: 'room_controller_spec5@example.com',
    password: 'password-room_controller_spec',
  };
  const testUserLogin = { email: testUser.email, password: testUser.password };
  let testUserId;
  let testUserAccessToken;
  let userController: UserController;

  const testRoom = {
    name: 'testRoom1',
  };
  let testRoomId;


  beforeEach(async () => {
    console.log('here is beforeEach!!');
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomController, UserController, AuthController],
      providers: [RoomService, PrismaService, UserService, AuthService, JwtService],
    }).compile();

    controller = module.get<RoomController>(RoomController);
    userController = module.get<UserController>(UserController);
    const authController: AuthController = module.get<AuthController>(AuthController);

    testUserId = await userController.create(testUser)
    .then((userEntity) => {
      return userEntity.id;
    });
    console.log('testUserId: ', testUserId);

    testUserAccessToken = await authController.login(testUserLogin).then((authEntity: AuthEntity) => {
      return authEntity.accessToken;
    });
    console.log('testUserAccessToken: ', testUserAccessToken);

    testRoomId = await controller.create(testUser, testUserAccessToken).then((roomEntity) => {
      return roomEntity.id;
    })
    .catch((err) => {
      console.log(err);
    });
    console.log('testRoomId: ', testRoomId);
    await controller.enterRoom(testRoomId, testUserAccessToken);
    return console.log(`${testUserId} ${testUserAccessToken} ${testRoomId}`);
  });

  afterEach(async () => {
    await controller.remove(testRoomId);
    await userController.remove(testUserId);
  });

  it('hould be defined', () => {
    expect(controller).toBeDefined();
  });
});
