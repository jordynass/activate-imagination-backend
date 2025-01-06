import { z } from 'zod';

export const StorySchema = z.object({
  storyPrompt: z.string(),
  photo: z
    .string()
    .regex(
      /^data:image\/[a-z]+;base64,[A-Za-z0-9+/]+={0,2}$/,
      'Invalid base64 image string',
    ),
});

export const SceneSchema = z.object({
  photo: z
    .string()
    .regex(
      /^data:image\/[a-z]+;base64,[A-Za-z0-9+/]+={0,2}$/,
      'Invalid base64 image string',
    ),
});

export type StoryDto = z.infer<typeof StorySchema>;
export type SceneDto = z.infer<typeof SceneSchema>;
