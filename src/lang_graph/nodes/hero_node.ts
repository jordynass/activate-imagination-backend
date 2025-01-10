import { interrupt } from '@langchain/langgraph';
import { type HumanMessage } from '@langchain/core/messages';

export function heroNode() {
  const heroActionMessage = interrupt<string, HumanMessage>(
    'What will you do?',
  );
  return { messages: [heroActionMessage] };
}
