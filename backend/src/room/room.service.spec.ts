import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';

describe('RoomService', () => {
  let service: RoomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomService, PrismaService],
    }).compile();

    service = module.get<RoomService>(RoomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    const user = { id: 1, name: 'user_create()' };
    const createRoomDto: CreateRoomDto = { name: 'testRoom1' };

    it('should create a room', async () => {
      const room = await service.create(createRoomDto, user);
      expect(room.name).toBe(createRoomDto.name);
    });
    it('should create another room', async () => {
      const room = await service.create(createRoomDto, user);
      expect(room).toHaveProperty('name');
    });
    it('should not create a room (user does not exist)', async () => {
      const NotExistUser = { id: 10000000, name: 'NotExistUser' };
      await expect(
        service.create(createRoomDto, NotExistUser),
      ).rejects.toThrow();
    });
  });

  describe('findAll()', () => {
    it('should return an array of rooms', async () => {
      const rooms = await service.findAll();
      expect(rooms).toBeInstanceOf(Array);
    });
  });

  describe('enterRoom()', () => {
    let room;

    beforeAll(async () => {
      const owner = { id: 1, name: 'owner_enterRoom()' };
      const createRoomDto: CreateRoomDto = { name: 'testRoom1' };
      room = await service.create(createRoomDto, owner);
    });

    it('should enter room', async () => {
      const validUser = { id: 2, name: 'validUser_enterRoom()' };
      const enteredRoom = await service.enterRoom(room.id, validUser);
      expect(enteredRoom).toHaveProperty('role');
    });
    it('should not enter a room', async () => {
      const NotExistUser = { id: 10000000, name: 'NotExistUser' };
      await expect(service.enterRoom(room.id, NotExistUser)).rejects.toThrow();
    });
  });

  describe('findOne()', () => {
    const user = { id: 1, name: 'test' };
    let roomId: number;
    const createRoomDto: CreateRoomDto = { name: 'testRoom1' };
    it('should throw error', async () => {
      await expect(service.findOne(10000000, user)).rejects.toThrow();
    });
    it('should return a room', async () => {
      const room = await service.create(createRoomDto, user);
      expect(room).toHaveProperty('id');
      expect(room).toHaveProperty('name');
      roomId = room.id;
    });
    it('should return a room', async () => {
      const room = await service.findOne(roomId, user);
      expect(room).toHaveProperty('id');
      expect(room).toHaveProperty('name');
      expect(room).toHaveProperty('users');
    });
  });

  describe('leaveRoom()', () => {
    const user = { id: 1, name: 'test_leaveRoom()' };
    let roomId: number;
    const createRoomDto: CreateRoomDto = { name: 'testRoom1' };

    beforeAll(async () => {
      const room = await service.create(createRoomDto, user);
      roomId = room.id;
    });

    it('should throw error', async () => {
      await expect(service.leaveRoom(10000000, user)).rejects.toThrow();
    });
    it('should return a room', () => {
      return service
        .leaveRoom(roomId, user)
        .then((UserOnRoom) => {
          expect(UserOnRoom.roomId).toBe(roomId);
          expect(UserOnRoom.userId).toBe(user.id);
        })
        .catch((err) => {
          throw err;
        });
    });
  });
});
