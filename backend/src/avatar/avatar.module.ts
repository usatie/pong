import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AvatarController } from './avatar.controller';
import { AvatarService } from './avatar.service';

@Module({
  controllers: [AvatarController],
  providers: [AvatarService],
  imports: [PrismaModule],
})
export class AvatarModule {}
