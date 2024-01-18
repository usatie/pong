import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { MuteController } from './mute.controller';
import { MuteService } from './mute.service';

describe('MuteController', () => {
  let controller: MuteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MuteController],
      providers: [MuteService, PrismaService],
    }).compile();

    controller = module.get<MuteController>(MuteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
