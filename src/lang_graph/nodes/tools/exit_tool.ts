import { tool } from '@langchain/core/tools';
import { END } from '@langchain/langgraph';
import { ExitEvent } from 'src/lang_graph/entities/output_events';
import { OutputService } from 'src/shared/output.service';
import { z } from 'zod';

// TODO: Add exit confirmation step
export function exitToolFactory(outputService: OutputService) {
  async function exitTool(_, config) {
    outputService.sendEvent<void, ExitEvent>(
      { type: 'exit' },
      config.configurable.thread_id, // Config thread_id matched gameId by design
    );
    return { next: END };
  }
  return tool(exitTool, {
    name: 'exit_game',
    description:
      'Exit the game when the user says they want to stop playing. \
Do not include any text content when responding with this tool.',
    schema: z.object({}),
  });
}
