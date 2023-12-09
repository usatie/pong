import { Module } from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { AvatarController } from './avatar.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [AvatarController],
  providers: [AvatarService],
  imports: [PrismaModule],
})
export class AvatarModule {}
