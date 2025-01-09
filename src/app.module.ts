import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { GameSessionGateway } from './game_session/game_session.gateway';
import { ConfigModule } from '@nestjs/config';
import { GraphService } from './lang_graph/graph_service/graph.service';
import { OutputService } from './shared/output.service';
import { AsyncInputService } from './shared/async_input.service';

@Module({
  imports: [
    // TODO (nit): Remove
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule available globally
    }),
  ],
  providers: [
    AppService,
    GameSessionGateway,
    GraphService,
    OutputService,
    AsyncInputService,
  ],
})
export class AppModule {}
