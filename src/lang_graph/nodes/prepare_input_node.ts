import { GraphAnnotation, InputAnnotation } from '../entities/state';
import { ChatPromptTemplate } from '@langchain/core/prompts';

export async function prepareInputNode(
  input: typeof InputAnnotation.State,
): Promise<typeof GraphAnnotation.State> {
  const { messages } = await promptTemplate.invoke({
    storyPrompt: input.storyPrompt,
  });
  return {
    messages,
    storyPrompt: input.storyPrompt,
  };
}

const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    'system',
    'I am a child on a themed treasure hunt and you are helping me to live out the following \
fantasy adventure by narrating it for me:\
\n<Story Prompt>{storyPrompt}</Story Prompt>\n \
Each time I request to start a new scene, you will describe the scene for me and ask me \
what I want to do. Then you will chat with me as I interact with any objects or characters \
in the scene.',
  ],
]);
