/**
 * @fileoverview Module providing factories for tool calls that need to access
 * injected dependencies.
 */

import { OutputService } from 'src/shared/output.service';
import { exitToolFactory } from './exit_tool';
import { Module } from '@nestjs/common';
import { type ChatAnthropicToolType } from '@langchain/anthropic/dist/types';
import { IoModule } from 'src/shared/io.module';
import { requestNewSceneToolFactory } from './request_new_scene_tool';

@Module({
  imports: [IoModule],
  providers: [
    {
      provide: 'TOOLS',
      useFactory: (outputService: OutputService): ChatAnthropicToolType[] => {
        return [
          exitToolFactory(outputService),
          requestNewSceneToolFactory(outputService),
        ];
      },
      inject: [OutputService],
    },
  ],
  exports: ['TOOLS'],
})
export class ToolsModule {}
