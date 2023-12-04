import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { PongMatchGateway } from './pong-match.gateway';

@Module({
  providers: [EventsGateway, PongMatchGateway],
})
export class EventsModule {}
