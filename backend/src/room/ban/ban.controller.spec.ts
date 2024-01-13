import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { BanController } from './ban.controller';
import { BanService } from './ban.service';

describe('BanController', () => {
  let controller: BanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BanController],
      providers: [BanService, PrismaService, EventEmitter2],
    }).compile();

    controller = module.get<BanController>(BanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
