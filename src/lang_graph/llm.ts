import { ChatAnthropic } from '@langchain/anthropic';
import { type ChatAnthropicToolType } from '@langchain/anthropic/dist/types';

export function newLlm(tools: ChatAnthropicToolType[] = []) {
  return new ChatAnthropic({
    model: 'claude-3-5-sonnet-latest',
    temperature: 0.1,
  }).bindTools(tools);
}
