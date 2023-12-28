import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { HistoryModule } from 'src/history/history.module';
import { EventsGateway } from './events.gateway';
import { PongMatchGateway } from './pong-match.gateway';

@Module({
  providers: [EventsGateway, PongMatchGateway],
  imports: [AuthModule, HistoryModule],
})
export class EventsModule {}
