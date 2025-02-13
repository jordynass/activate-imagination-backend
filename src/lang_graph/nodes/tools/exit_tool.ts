import { tool } from '@langchain/core/tools';
import { z } from 'zod';

// TODO: MAKE THIS SEND AN "END GAME MESSAGE" AND END THE GAME
// TODO: HAVE IT ISSUE A CONFIRMATION REQUEST IN A FOLLOW UP
// TODO: WE ALSO NEED A adventure_update_tool (WHICH MIGHT NEED TO BE A NODE, BECAUSE IT SHOULD ALSO BE ASYNC TRIGGERED GAME UPDATING)
// AND A request_scene_tool NODE 

const exit = tool(
  () => {
    return { next: END }
  },
  {
    name: 'request_exit',
    description:
      'Shut down the game because the user says they want to stop playing.',
    schema: z.object({
      noOp: z.string().optional().describe('No-op parameter.'),
    }),
  },
);

export default [exit];
