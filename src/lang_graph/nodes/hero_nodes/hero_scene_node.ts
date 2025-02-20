import { interrupt } from '@langchain/langgraph';
import { type HumanMessage } from '@langchain/core/messages';

export function heroSceneNode() {
  const heroSceneMessage = interrupt<string, HumanMessage>(
    'Show me your new setting?',
  );
  return { messages: [heroSceneMessage] };
}
