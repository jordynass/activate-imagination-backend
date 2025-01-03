import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameSessionGateway } from './game_session/game_session.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, GameSessionGateway],
})
export class AppModule {}
