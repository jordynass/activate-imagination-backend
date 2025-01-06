import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { GameSessionGateway } from './game_session/game_session.gateway';
import { ConfigModule } from '@nestjs/config';
import { GraphService } from './lang_graph/graph_service';
import { OutputService } from './output/output.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule available globally
    }),
  ],
  providers: [AppService, GameSessionGateway, GraphService, OutputService],
})
export class AppModule {}
