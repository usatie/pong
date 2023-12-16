import { PrismaClient } from '@prisma/client';
import { RoomService } from './room.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('RoomService', () => {
  it('should be defined', () => {
    expect(
      new RoomService(new PrismaClient(), new EventEmitter2()),
    ).toBeDefined();
  });
});
