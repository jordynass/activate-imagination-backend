import { BaseMessage } from '@langchain/core/messages';
import { Annotation, messagesStateReducer } from '@langchain/langgraph';

export const InputAnnotation = Annotation.Root({
  storyPrompt: Annotation<string>,
});

export const GraphAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  storyPrompt: Annotation<string>,
});
