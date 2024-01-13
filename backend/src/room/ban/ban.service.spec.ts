import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { BanService } from './ban.service';

describe('BanService', () => {
  let service: BanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BanService, PrismaService, EventEmitter2],
    }).compile();

    service = module.get<BanService>(BanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
