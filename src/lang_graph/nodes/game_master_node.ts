import { Command, END } from '@langchain/langgraph';
import { GraphAnnotation } from '../entities/state';
import { type BaseMessage } from '@langchain/core/messages';
import { InputKey } from 'src/shared/async_input.service';
import { newLlm } from '../llm';

export async function gameMasterNode(
  state: typeof GraphAnnotation.State,
): Promise<Command> {
  const latestMsg = state.messages[state.messages.length - 1];
  const msgType = getMsgType(latestMsg);
  switch (msgType) {
    case MessageType.QUIT:
      return new Command({ goto: END });
    case MessageType.ACTION:
      return new Command({
        goto: 'heroNode',
        update: { messages: [await newLlm().invoke(state.messages)] },
      });
    default:
      console.error(
        `Game Master Node does not recognize the most recent message on the main game thread:
${JSON.stringify(latestMsg.toJSON(), null, 2)}`,
      );
      return new Command({ goto: END });
  }
}

enum MessageType {
  ACTION,
  NEW_SCENE,
  QUIT,
  UNKNOWN,
}

function getMsgType(msg: BaseMessage): MessageType {
  if (typeof msg.content === 'string') {
    // TODO: Make this an InputKey rather than text
    if (['quit', 'q'].includes(msg.content)) {
      return MessageType.QUIT;
    }
    if (msg.additional_kwargs.inputKey === InputKey.ACTION) {
      return MessageType.ACTION;
    }
  }
  return MessageType.UNKNOWN;
}
