import { ChatAnthropic } from '@langchain/anthropic';
import { type ChatAnthropicToolType } from '@langchain/anthropic/dist/types';
import { AIMessageChunk, type BaseMessage } from '@langchain/core/messages';

const RETRIES = 3;
const DELAY = 300;
const BACKOFF = 2;

export async function queryLlm(
  messages: BaseMessage[],
  tools: ChatAnthropicToolType[] = [],
): Promise<AIMessageChunk> {
  const llm = newLlm(tools);
  let currentDelay = DELAY;
  for (let i = 0; i < RETRIES; i++) {
    try {
      return await llm.invoke(messages);
    } catch (e) {
      if (i + 1 === RETRIES) {
        console.error(
          `LLM call hit retry maximum (${RETRIES}) following the error below.`,
          e,
        );
        throw e;
      }
      console.error(`Retrying LLM call following the error below.`, e);
      await wait(currentDelay);
      currentDelay *= BACKOFF;
    }
  }
  throw new Error(
    'LLM call retry mechanism failure (this should never happen).',
  );
}

function newLlm(tools: ChatAnthropicToolType[] = []) {
  return new ChatAnthropic({
    model: 'claude-3-5-sonnet-latest',
    temperature: 0.1,
  }).bindTools(tools);
}

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
