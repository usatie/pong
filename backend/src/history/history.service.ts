import { Injectable } from '@nestjs/common';
import { CreateHistoryDto } from './dto/create-history.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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

  findAll(userId: number) {
    return this.prisma.user
      .findFirstOrThrow({
        where: { id: userId },
      })
      .history();
  }
}
