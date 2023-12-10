import { Test, TestingModule } from '@nestjs/testing';
import { AvatarService } from './avatar.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('AvatarService', () => {
  let service: AvatarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AvatarService, PrismaService],
    }).compile();

    service = module.get<AvatarService>(AvatarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
