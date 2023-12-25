import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { PongMatchGateway } from './pong-match.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [EventsGateway, PongMatchGateway],
  imports: [AuthModule],
})
export class EventsModule {}
