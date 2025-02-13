import { OutputService } from 'src/shared/output.service';
import { exitToolFactory } from './exit_tool';
import { Module } from '@nestjs/common';
import { type ChatAnthropicToolType } from '@langchain/anthropic/dist/types';
import { IoModule } from 'src/shared/io.module';

@Module({
  imports: [IoModule],
  providers: [
    {
      provide: 'TOOLS',
      useFactory: (outputService: OutputService): ChatAnthropicToolType[] => {
        return [exitToolFactory(outputService)];
      },
      inject: [OutputService],
    },
  ],
  exports: ['TOOLS'],
})
export class ToolsModule {}
