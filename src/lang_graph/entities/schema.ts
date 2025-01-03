import { z } from 'zod';

export const CharacterSchema = z.object({
  id: z.number().describe("A unique integer ID"),
  name: z.string().describe("The name most commonly used for the character"),
  physical: z.string().describe("A one or two sentence description of the character's physical traits that would be visible to a normal observer"),
});