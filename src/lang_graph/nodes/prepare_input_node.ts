/**
 * @fileoverview Informal node (i.e. called outside the LangGraph framework)
 * for converting the user's initial story prompt (i.e. text and photo) into an initial
 * graph state.
 */

import { StoryDto } from 'src/lang_graph/entities/io';
import { GraphAnnotation, type Scene } from 'src/lang_graph/entities/state';
import { ChatPromptTemplate } from '@langchain/core/prompts';

export async function prepareInputNode(
  input: StoryDto,
): Promise<typeof GraphAnnotation.State> {
  const { messages } = await promptTemplate.invoke({
    storyPrompt: input.storyPrompt,
  });
  return {
    gameId: input.gameId,
    messages,
    storyPrompt: input.storyPrompt,
    currentScene: { photo: input.photo },
    sceneById: new Map<string, Scene>(),
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
in the scene. After scene exposition, cap each response at 200 words.',
  ],
]);
