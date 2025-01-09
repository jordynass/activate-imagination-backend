import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { GameSessionGateway } from './game_session/game_session.gateway';
import { ConfigModule } from '@nestjs/config';
import { GraphService } from './lang_graph/graph_service/graph.service';
import { OutputService } from './shared/output.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule available globally
    }),
  ],
  providers: [AppService, GameSessionGateway, GraphService, OutputService],
})
export class AppModule {}
