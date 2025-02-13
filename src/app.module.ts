import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { GameSessionGateway } from './game_session/game_session.gateway';
import { ConfigModule } from '@nestjs/config';
import { GraphService } from './lang_graph/graph_service/graph.service';
import { NodesModule } from './lang_graph/nodes/nodes.module';
import { ToolsModule } from './lang_graph/nodes/tools/tools.module';
import { IoModule } from './shared/io.module';

@Module({
  imports: [
    // TODO (nit): Remove
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule available globally
    }),
    ToolsModule,
    NodesModule,
    IoModule,
  ],
  providers: [AppService, GameSessionGateway, GraphService],
})
export class AppModule {}
