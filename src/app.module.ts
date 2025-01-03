import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameSessionGateway } from './game_session/game_session.gateway';
import { ConfigModule } from '@nestjs/config';
import { GraphService } from './lang_graph/graph_service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule available globally
    }),
  ],
  controllers: [AppController],
  providers: [AppService, GameSessionGateway, GraphService],
})
export class AppModule {}