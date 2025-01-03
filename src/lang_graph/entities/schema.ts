import { z } from 'zod';

export const CharacterSchema = z.object({
  id: z.number().describe('A unique integer ID'),
  name: z.string().describe('The name most commonly used for the character'),
  current: z.string().describe(
    'A one or two sentence description of the character\'s current situation. If they are interacting \
    with another character or item, refer to as XML tags, e.g. <Character id="5">Bob</Character> or \
    <Item id="3">the sword</Item>.',
  ),
  physical: z
    .string()
    .describe(
      "A one or two sentence description of the character's physical traits that would be visible to a normal observer",
    ),
});

export const ItemSchema = z.object({
  id: z.number().describe('A unique integer ID'),
  real: z.string().describe('A physical object in the real world'),
  fantasy: z
    .string()
    .describe(
      'An object in the fantasy world that resembles the real object in form or function',
    ),
});

export const SettingSchema = z.object({
  id: z.number().describe('A unique integer ID'),
  setting: z.string().describe(
    'A physical description of the fantasy setting of persistent \
attributes of the state. This should consist of sensory details (mostly visual) \
that are unlikely to change in the action of the scene, e.g. geological features \
or buildings or large furniture, rather than transient aspects, e.g. characters \
in the scene or small items that somebody could easily take.',
  ),
});

export const SceneSchema = z.object({
  items: z.array(ItemSchema).describe(
    'A list of items in the scene. These should be objects in the real world that have \
    a corresponding object in the fantasy world',
  ),
  characters: z
    .array(CharacterSchema)
    .describe('A list of sentient characters in the scene'),
  setting: SettingSchema.describe('The setting of the scene'),
});
