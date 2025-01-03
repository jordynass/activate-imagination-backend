import { ChatAnthropic } from '@langchain/anthropic';

export function newLlm() {
  return new ChatAnthropic({
    model: 'claude-3-5-sonnet-latest',
    temperature: 0.1,
  });
}
