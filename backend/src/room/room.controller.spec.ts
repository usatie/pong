import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaClient } from '@prisma/client';
import { RoomService } from './room.service';

describe('RoomService', () => {
  it('should be defined', () => {
    expect(
      new RoomService(new PrismaClient(), new EventEmitter2()),
    ).toBeDefined();
  });
});
