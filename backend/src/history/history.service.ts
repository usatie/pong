import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHistoryDto } from './dto/create-history.dto';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateHistoryDto) {
    return this.prisma.match.create({
      data: {
        players: {
          create: [
            {
              userId: dto.winner.userId,
              score: dto.winner.score,
              winLose: 'WIN',
            },
            {
              userId: dto.loser.userId,
              score: dto.loser.score,
              winLose: 'LOSE',
            },
          ],
        },
        result: 'COMPLETE',
      },
    });
  }

  // TODO: Remove password from response
  findAll(userId: number) {
    const SelectUser = {
      select: {
        id: true,
        name: true,
        avatarURL: true,
      },
    };
    const SelectPlayer = {
      select: {
        score: true,
        winLose: true,
        user: SelectUser,
      },
    };
    const SelectHistory = {
      select: {
        id: true,
        players: SelectPlayer,
        result: true,
        createdAt: true,
      },
    };
    return this.prisma.match.findMany({
      where: {
        players: {
          some: {
            userId,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...SelectHistory,
    });
  }
}
