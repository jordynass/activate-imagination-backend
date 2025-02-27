import { getAIMessageChunkText, newId } from './utils';
import { AIMessageChunk } from '@langchain/core/messages';

describe('getAIMessageChunkText', () => {
  it('extracts text from simple messages', () => {
    const result = getAIMessageChunkText(new AIMessageChunk('some content'));
    expect(result).toEqual('some content');
  });

  it('extracts text from complex messages', () => {
    const result = getAIMessageChunkText(
      new AIMessageChunk({
        content: [
          {
            type: 'text_delta',
            text: 'some ',
          },
          {
            type: 'text_delta',
            text: 'content',
          },
        ],
      }),
    );
    expect(result).toEqual('some content');
  });
});

// Note: These tests are non-deterministic but the functionality is simple enough that it will suffice.
describe('newId', () => {
  it('effectively avoids collisions', () => {
    const TRIALS = 500;
    const ids = new Set<string>();
    for (let i = 0; i < TRIALS; i++) {
      ids.add(newId());
    }
    expect(ids.size).toEqual(TRIALS);
  });

  it('produces and alphanumeric string of the right length', () => {
    expect(newId(3)).toMatch(/^[a-zA-Z0-9]{3}$/);
    expect(newId(10)).toMatch(/^[a-zA-Z0-9]{10}$/);
    expect(newId(27)).toMatch(/^[a-zA-Z0-9]{27}$/);
  });
});
