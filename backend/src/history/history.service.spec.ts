import { Test, TestingModule } from '@nestjs/testing';
import { HistoryService } from './history.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MatchResultType } from '@prisma/client';

describe('HistoryService', () => {
  let service: HistoryService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistoryService, PrismaService],
    }).compile();

    service = module.get<HistoryService>(HistoryService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of matches with players and user details', async () => {
      // Arrange
      const userId = 1;
      const expectedMatches = [
        {
          id: 1,
          players: [
            {
              id: 1,
              userId: 1,
              user: {
                id: 1,
                name: 'John Doe',
              },
            },
            {
              id: 2,
              userId: 2,
              user: {
                id: 2,
                name: 'Jane Smith',
              },
            },
          ],
          result: 'COMPLETE' as MatchResultType,
          createdAt: new Date(),
        },
        // Add more expected matches if needed
      ];

      jest
        .spyOn(prismaService.match, 'findMany')
        .mockResolvedValue(expectedMatches);

      // Act
      const result = await service.findAll(userId);

      // Assert
      expect(result).toEqual(expectedMatches);
      expect(prismaService.match.findMany).toHaveBeenCalledWith({
        where: {
          players: {
            some: {
              userId,
            },
          },
        },
        include: {
          players: {
            include: {
              user: true,
            },
          },
        },
      });
    });
  });
});
