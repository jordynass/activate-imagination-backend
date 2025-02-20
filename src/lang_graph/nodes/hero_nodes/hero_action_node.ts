/**
 * @fileoverview Node for that interrupts graph to wait for regular simple
 * action input from the user.
 */

import { interrupt } from '@langchain/langgraph';
import { type HumanMessage } from '@langchain/core/messages';

export function heroActionNode() {
  const heroActionMessage = interrupt<string, HumanMessage>(
    'What will you do?',
  );
  return { messages: [heroActionMessage] };
}
