import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('RoomService', () => {
  let service: RoomService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomService, PrismaService, EventEmitter2],
    }).compile();

    service = module.get<RoomService>(RoomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
