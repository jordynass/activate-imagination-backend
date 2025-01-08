import { BaseMessage } from '@langchain/core/messages';
import { Annotation, messagesStateReducer } from '@langchain/langgraph';

export type Scene = {
  id: number;
  photo: string;
  intro: string;
  setting: string;
  itemIds: Set<number>;
  characterIds: Set<number>;
};

type SceneMonitor = {
  id: number;
  photo: string;
  intro: string;
};

export const GraphAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  currentScene: Annotation<Partial<SceneMonitor>>,
  sceneById: Annotation<Map<number, Scene>>({
    reducer: (oldMap: Map<number, Scene>, newMap: Map<number, Scene>) => {
      const combinedMap = new Map<number, Scene>(oldMap);
      for (const id of newMap.keys()) {
        const oldScene = oldMap.get(id) ?? {};
        const newScene = newMap.get(id);
        combinedMap.set(id, { ...oldScene, ...newScene });
      }
      return combinedMap;
    },
    default: () => new Map<number, Scene>(),
  }),
  storyPrompt: Annotation<string>,
});
