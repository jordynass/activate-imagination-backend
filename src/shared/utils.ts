import {
  AIMessageChunk,
  MessageContentComplex,
} from '@langchain/core/messages';
import { AssertionError } from 'assert';

export function getAIMessageChunkText(chunk: AIMessageChunk): string {
  if (typeof chunk.content === 'string') {
    return chunk.content;
  }
  const complexContentList: MessageContentComplex[] = chunk.content;
  const allText = complexContentList.map((mcc) => (mcc as any).text ?? '');
  return allText.join('');
}

/**
 * Because collisions and security are irrelevant and nanoid is causing
 * jest issues, I just created a simple ID generator.
 */
export function newId(length: number = 5): string {
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const random = () => (Math.random() * (Date.now() % 8675309)) % 1;
  const randomInt = (max: number) => Math.floor(max * random());
  const idCharacters = Array.from(
    { length },
    () => alphabet[randomInt(alphabet.length)],
  );
  return idCharacters.join('');
}

/** This is factored rather than used from a library to support non-fatal prod assertions */
export function assert<T>(value: T | undefined | null): T {
  if (value === null || value === undefined) {
    // TODO: Graceful handling in Prod
    throw new AssertionError({
      expected: 'Something non-null and non-undefined',
      actual: value,
    });
  }
  return value;
}
