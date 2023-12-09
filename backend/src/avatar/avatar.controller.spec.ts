import { Test, TestingModule } from '@nestjs/testing';
import { AvatarController } from './avatar.controller';
import { AvatarService } from './avatar.service';

describe('AvatarController', () => {
  let controller: AvatarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvatarController],
      providers: [AvatarService],
    }).compile();

    controller = module.get<AvatarController>(AvatarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
