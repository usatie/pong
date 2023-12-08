import { Test, TestingModule } from '@nestjs/testing';
import { FriendRequestController } from './friend-request.controller';
import { FriendRequestService } from './friend-request.service';
import { PrismaService } from 'src/prisma/prisma.service';

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
