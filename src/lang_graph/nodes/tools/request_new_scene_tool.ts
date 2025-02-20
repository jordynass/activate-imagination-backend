import { tool } from '@langchain/core/tools';
import { OutputService } from 'src/shared/output.service';
import { z } from 'zod';

export function requestNewSceneToolFactory(outputService: OutputService) {
  async function requestNewSceneTool(_, config) {
    outputService.sendEvent(
      { type: 'newScene' },
      config.configurable.thread_id, // Config thread_id matched gameId by design
    );
    return { next: 'heroSceneNode' };
  }
  return tool(requestNewSceneTool, {
    name: 'request_new_scene',
    description:
      'Ask the user for a photo of their surroundings because their actions \
led them into a new setting. For instance, if they open a door, climb up a \
hill, or enter a cave.',
    schema: z.object({}),
  });
}
