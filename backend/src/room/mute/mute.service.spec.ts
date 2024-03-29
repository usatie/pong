import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { MuteService } from './mute.service';

describe('MuteService', () => {
  let service: MuteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MuteService, PrismaService, EventEmitter2],
    }).compile();

    service = module.get<MuteService>(MuteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
