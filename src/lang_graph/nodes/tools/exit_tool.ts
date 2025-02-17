import { tool } from '@langchain/core/tools';
import { END } from '@langchain/langgraph';
import { OutputService } from 'src/shared/output.service';
import { z } from 'zod';

// TODO: Add exit confirmation step
export function exitToolFactory(outputService: OutputService) {
  async function exitTool(_, config) {
    outputService.sendEvent({ type: 'exit' }, config.configurable.thread_id); // Config thread_id matched gameId by design
    return { next: END };
  }
  return tool(exitTool, {
    name: 'exit_game',
    description: 'Exit the game when the user says they want to stop playing',
    schema: z.object({}),
  });
}
