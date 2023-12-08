import { Test, TestingModule } from '@nestjs/testing';
import { FriendRequestService } from './friend-request.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('FriendRequestService', () => {
  let service: FriendRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FriendRequestService, PrismaService],
    }).compile();

    service = module.get<FriendRequestService>(FriendRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
