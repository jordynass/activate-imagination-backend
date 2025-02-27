import { BaseMessage } from '@langchain/core/messages';
import { Annotation, messagesStateReducer } from '@langchain/langgraph';
import { assert } from 'src/shared/utils';

export interface Scene {
  id: string;
  photo: string;
  intro: string;
  setting: string;
  itemIds: Set<string>;
  characterIds: Set<string>;
}

interface SceneMonitor {
  id: string;
  photo: string | null; // See StorySchema definition for comment explaining nullability. TODO: Remove "| null".
  intro: string;
}

export const GraphAnnotation = Annotation.Root({
  gameId: Annotation<string>,
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  currentScene: Annotation<Partial<SceneMonitor>>,
  sceneById: Annotation<Map<string, Scene>>({
    reducer: (oldMap: Map<string, Scene>, newMap: Map<string, Scene>) => {
      const combinedMap = new Map<string, Scene>(oldMap);
      for (const id of newMap.keys()) {
        const oldScene = oldMap.get(id) ?? {};
        const newScene = assert(newMap.get(id));
        combinedMap.set(id, { ...oldScene, ...newScene });
      }
      return combinedMap;
    },
    default: () => new Map<string, Scene>(),
  }),
  storyPrompt: Annotation<string>,
});
