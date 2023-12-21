import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { FriendRequestController } from './friend-request.controller';
import { FriendRequestService } from './friend-request.service';

describe('FriendRequestController', () => {
  let controller: FriendRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendRequestController],
      providers: [FriendRequestService, PrismaService],
    }).compile();

    controller = module.get<FriendRequestController>(FriendRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
