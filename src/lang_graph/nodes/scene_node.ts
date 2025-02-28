/**
 * @fileoverview Node for prompting an LLM for a scene description from a story prompt
 * (i.e. text and photo) when the hero changes setting or starts a new adventure.
 */

import { ChatPromptTemplate } from '@langchain/core/prompts';
import { GraphAnnotation } from '../entities/state';
import { newLlm } from 'src/lang_graph/llm';
import { HumanMessage } from '@langchain/core/messages';
import { getAIMessageChunkText, newId } from 'src/shared/utils';
// import { AIMessageChunk } from '@langchain/core/messages';

export async function sceneNode(state: typeof GraphAnnotation.State) {
  const { photo } = state.currentScene;
  const { messages } = await promptTemplate.invoke({
    storyPrompt: state.storyPrompt,
  });
  messages.push(
    new HumanMessage({
      content: photo
        ? [
            {
              type: 'text',
              text: 'Describe this setting as though it were in my fantasy.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${photo}`,
              },
            },
          ]
        : 'Describe the setting for a new scene in my fantasy.',
    }),
  );
  // UNCOMMENT TO FAKE LLM CALL:
  // return {
  //   messages: [
  //     new AIMessageChunk('fake '),
  //     new AIMessageChunk('scene '),
  //     new AIMessageChunk('generation'),
  //   ],
  // };
  const response = await newLlm().invoke(messages);
  const intro = getAIMessageChunkText(response);
  const id = newId();
  return {
    messages: [response],
    currentScene: { photo, id, intro },
  };
}

const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    'system',
    'I am a child and you are helping design a themed treasure \
hunt for me. As I explore the physical space, I will send you photos of my \
current setting. If I forget to include a photo, you should pretend I\'m in a \
school gymnasium. You must describe each of them as though it were a scene in \
the following fantasy adventure:\n<Story Prompt>{storyPrompt}</Story \
Prompt>\nWhen you describe the setting, pretend that real items in the room \
are items that make sense in the fantasy that are similar in form or function. \
For example, if the adventure is space-themed and the setting includes a TV \
screen, the description could include "The ship\'s control panel (TV screen) \
shows all kinds of graphs and diagrams". Or, if the adventure involves \
exploring ancient ruins, and the setting is a tree-lined street, the \
description could include "You come upon a large temple whose mighty pillars \
(trees) support a high ceiling (leaves) of emerald green." Unless otherwise \
specified, each scene should include at least 2 sentient characters with whom \
I can interact. You should include the character\'s name and a parenthetical \
physical description of one to two sentences. For example, if the adventure is \
pirate themed, the description could include "In front of the ship\'s great \
helm (analog clock) stands Captain Bucky (An experienced and sailor in his 50s \
whose tough wrinkled skin tell of a tough life at sea). Cap your entire response \
at 250 words. Once you have explained the scene, ask me what I want to do."',
  ],
]);
