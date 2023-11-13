import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UserOnRoomDto } from './dto/user-on-room.dto';
import { notEqual } from 'assert';

describe('RoomService', () => {
  let service: RoomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomService, PrismaService],
    }).compile();

    service = module.get<RoomService>(RoomService);
  });

  //   it('should be defined', () => {
  //     expect(service).toBeDefined();
  //   });

  describe('findAll()', () => {
    it('should return an array of rooms', async () => {
      const rooms = await service.findAll();
      expect(rooms).toBeInstanceOf(Array);
    });
  });

  describe('enterRoom()', () => {
    let roomId: number;
    const user = { id: 1, name: 'test' };
    const createRoomDto: CreateRoomDto = { name: 'testRoom1', userId: user.id };

    it('should create a room', async () => {
      const room = await service.create(createRoomDto);
      console.log(room);
      expect(room).toHaveProperty('id');
      expect(room).toHaveProperty('name');
      roomId = room.id;
    });
    it('should create a room', async () => {
      const room = await service.create(createRoomDto);
      console.log(room);
      expect(room).toHaveProperty('id');
      expect(room).toHaveProperty('name');
      roomId = room.id;
    });
    it('should not create a room', async () => {
      const NotExistUserId = 10000000;
      await expect(
        service.create({ name: 'testRoom1', userId: NotExistUserId }),
      ).rejects.toThrow();
    });
  });

  describe('findOne()', () => {
    const user = { id: 1, name: 'test' };
    let roomId: number;
    const createRoomDto: CreateRoomDto = { name: 'testRoom1', userId: user.id };
    it('should throw error', async () => {
      await expect(service.findOne(10000000, user.id)).rejects.toThrow();
    });
    it('should return a room', async () => {
      const room = await service.create(createRoomDto);
      console.log(room);
      expect(room).toHaveProperty('id');
      expect(room).toHaveProperty('name');
      roomId = room.id;
    });
    it('should return a room', async () => {
      const room = await service.findOne(roomId, user.id);
      console.log(room);
      expect(room).toHaveProperty('id');
      expect(room).toHaveProperty('name');
      expect(room).toHaveProperty('users');
    });
  });

  describe('leaveRoom()', () => {
    const user = { id: 1, name: 'test' };
    let roomId: number;
    const createRoomDto: CreateRoomDto = { name: 'testRoom1', userId: user.id };
    it('should throw error', async () => {
      await expect(service.leaveRoom(10000000, user.id)).rejects.toThrow();
    });
    it('should return a room', async () => {
      const room = await service.create(createRoomDto);
      console.log(room);
      expect(room).toHaveProperty('id');
      expect(room).toHaveProperty('name');
      roomId = room.id;
    });
    it('should return a room', () => {
      return service
        .leaveRoom(roomId, user.id)
        .then((room) => {
          console.log(room);
          expect(room.id).toBe(roomId);
          expect(room.userid).toBe(user.id);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  });
  // describe('/room/:id (POST)', () => {
  // 	let roomId: number;
  // 	const user = {id: 1, name: 'test'};
  // 	const createRoomDto: CreateRoomDto = {name: 'testRoom1', userId: user.id};

  // 	const room = await service.create(createRoomDto);
  // 	it('should enter a room', async () => {
  // 		const room = await service.create(createRoomDto);
  // 		console.log(room);
  // 		expect(room).toHaveProperty('id');
  // 		expect(room).toHaveProperty('name');
  // 		roomId = room.id;
  // 	})
  // 	it('should not create a room', async () => {
  // 		const NotExistUserId = 10000000;
  // 		await expect(service.create({name: 'testRoom1', userId: NotExistUserId})).rejects.toThrow();
  // 	})

  // })

  // it('should return a room', async () => {
  // 	const room = await service.findOne(roomId, user.id);
  // 	console.log(room);
  // 	expect(room).toHaveProperty('id');
  // 	expect(room).toHaveProperty('name');
  // })
  // it('should return an error', async () => {
  // 	const room = await service.findOne(roomId + 1, user.id);
  // 	console.log(room);

  // })
  // it('should return an error', async () => {
  // 	const room = await service.findOne(roomId, user.id + 1);
  // 	console.log(room);
  // 	expect(room).toHaveProperty('error');
  // })
  // it('should remove a room', async () => {
  // 	const room = await service.leaveRoom(roomId, user.id);
  // 	console.log(room);
  // 	expect(room).toHaveProperty('id');
  // 	expect(room).toHaveProperty('name');
  // })
  // it('should return an error', async () => {
  // 	const room = await service.leaveRoom(roomId, user.id);
  // 	console.log(room);
  // 	expect(room).toHaveProperty('error');
  // })
  // it('should return an error', async () => {
  // 	const room = await service.findOne(roomId, user.id);
  // 	console.log(room);
  // })

  // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImlhdCI6MTY5OTg2Mjg3NiwiZXhwIjoxNjk5ODY0Njc2fQ.ks3iRk8bKv6PGLV8V04zuB18xJ1l9CcVCQH_xjaIFnE

  /*
{
	"email": "susami@example.com",
	"password": "password-susami"
}
*/

  /*
{
	"email": "kakiba@example.com",
	"password": "password-kakiba"
}
*/

  // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY5OTg2MjgwMiwiZXhwIjoxNjk5ODY0NjAyfQ.OaQlF9NZTfbKaQ9-Ac4cSqZQU6oJE2de1Z-a-fsvH4A
});
