import { Module } from '@nestjs/common';
import { ToolsModule } from './tools/tools.module';
import { gameMasterNodeFactory } from './game_master_node';

@Module({
  imports: [ToolsModule],
  providers: [
    {
      provide: 'GAME_MASTER_NODE',
      useFactory: (tools) => gameMasterNodeFactory(tools),
      inject: ['TOOLS'],
    },
  ],
  exports: ['GAME_MASTER_NODE'],
})
export class NodesModule {}
