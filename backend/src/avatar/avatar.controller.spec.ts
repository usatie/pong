import { Test, TestingModule } from '@nestjs/testing';
import { AvatarController } from './avatar.controller';
import { AvatarService } from './avatar.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('AvatarController', () => {
  let controller: AvatarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvatarController],
      providers: [AvatarService, PrismaService],
    }).compile();

    controller = module.get<AvatarController>(AvatarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
