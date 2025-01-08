import { z } from 'zod';

const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;

export const StorySchema = z.object({
  storyPrompt: z.string(),
  photo: z.string().regex(base64Regex, 'Invalid base64 image string'),
});

export const SceneSchema = z.object({
  photo: z.string().regex(base64Regex, 'Invalid base64 image string'),
});

export type StoryDto = z.infer<typeof StorySchema>;
export type SceneDto = z.infer<typeof SceneSchema>;
