/**
 * @fileoverview Node that serves as the main agent responsible for
 * coordinating game flow
 */

import { Command } from '@langchain/langgraph';
import { GraphAnnotation } from '../entities/state';
import { newLlm } from '../llm';

export function gameMasterNodeFactory(tools) {
  async function gameMasterNode(
    state: typeof GraphAnnotation.State,
  ): Promise<Command> {
    const nextMessage = await newLlm(tools).invoke(state.messages);
    if (
      'tool_calls' in nextMessage &&
      Array.isArray(nextMessage.tool_calls) &&
      nextMessage.tool_calls?.length
    ) {
      return new Command({
        goto: 'toolNode',
        update: { messages: [nextMessage] },
      });
    }
    return new Command({
      goto: 'heroActionNode',
      update: { messages: [nextMessage] },
    });
  }
  return gameMasterNode;
}
