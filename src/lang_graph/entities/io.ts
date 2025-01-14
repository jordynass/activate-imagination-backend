import { z } from 'zod';

const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;

export const StorySchema = z.object({
  gameId: z.string(),
  storyPrompt: z.string(),
  // TODO: Nullable for testing without wasting image tokens. A
  // better pattern is to replace the newLlm() utility with a service
  // LlmService that delegates to an LLM or a fake. That provides
  // Options to (a) just return fake data to test the frontend,
  // (b) ignore the photo for testing of most, i.e. not photo
  // dependent, functionality or (c) send full functionality.
  // Then I can bind to the desired level or realism in the module.
  photo: z
    .string()
    .regex(base64Regex, 'Invalid base64 image string')
    .nullable()
    .optional(),
});

export const SceneSchema = z.object({
  gameId: z.string(),
  photo: z.string().regex(base64Regex, 'Invalid base64 image string'),
});

export const ActionSchema = z.object({
  gameId: z.string(),
  text: z.string(),
});

export type StoryDto = z.infer<typeof StorySchema>;
export type SceneDto = z.infer<typeof SceneSchema>;
export type ActionDto = z.infer<typeof ActionSchema>;
