import { Module } from '@nestjs/common';
import { BanService } from './ban.service';
import { BanController } from './ban.controller';

@Module({
  controllers: [BanController],
  providers: [BanService],
})
export class BanModule {}
