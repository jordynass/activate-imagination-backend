import { interrupt } from '@langchain/langgraph';

export function heroSceneNode() {
  const photo = interrupt<string, string>('Show me your new setting?');
  return {
    currentScene: {
      photo,
    },
  };
}
