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

describe('RoomController', () => {
  let controller: RoomController;
  let testUserOwner = {
    name: 'room_controller_spec',
    email: 'room_controller_spec@example.com',
    password: 'password-room_controller_spec',
    id: <number>undefined,
    accessToken: undefined,
  };
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

    testUserOwner.id = await userController
      .create(testUserOwner)
      .then((userEntity) => {
        return userEntity.id;
      });

    testUserOwner.accessToken = await authController
      .login(testUserOwner)
      .then((authEntity: AuthEntity) => {
        return authEntity.accessToken;
      });
	testRoom.roomId = await roomService // controller で書きたいけど request の書き方が分からない
	.create(testRoom, { id: testUserOwner.id, name: testUserOwner.name })
	.then((roomEntity: RoomEntity) => {
	  return roomEntity.id;
	});
  });

  afterEach(async () => {
    try {
	  await controller.removeRoom(testRoom.roomId);
	  await userController.remove(testUserOwner.id);
    } catch (error) {
      throw error;
    }
  });

  it('would be defined', () => {
    expect(controller).toBeDefined();
  });
});
