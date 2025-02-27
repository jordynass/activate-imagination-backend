import { Injectable } from '@nestjs/common';
import {
  type InputEvent,
  InputKey,
} from 'src/lang_graph/entities/input_events';
import { assert } from './utils';

@Injectable()
export class AsyncInputService {
  // This typing is a lazy because the InputKey determines the Payload type for a given queue.
  // That said, I don't think the additional type safety is worth the effort of refactoring into
  // nested maps to support InputKey-specific Payload types.
  private inputQueueMap = new Map<string, any[]>();
  private requestQueueMap = new Map<string, PromiseWithResolvers<any>[]>();

  sendInput<Payload>({ key, gameId, payload }: InputEvent<Payload>) {
    const requestQueue = this.requestQueueMap.get(toMapKey(key, gameId)) ?? [];
    const inputQueue = this.inputQueueMap.get(toMapKey(key, gameId)) ?? [];
    if (requestQueue.length > 0) {
      const { resolve } = assert(requestQueue.shift());
      resolve(payload);
    } else {
      inputQueue.push(payload);
      this.inputQueueMap.set(toMapKey(key, gameId), inputQueue);
    }
  }

  async requestInput(key: InputKey, gameId: string): Promise<string> {
    const requestQueue = this.requestQueueMap.get(toMapKey(key, gameId)) ?? [];
    const inputQueue = this.inputQueueMap.get(toMapKey(key, gameId)) ?? [];
    if (inputQueue.length > 0) {
      return assert(inputQueue.shift());
    }
    const inputPromise = Promise.withResolvers<string>();
    requestQueue.push(inputPromise);
    this.requestQueueMap.set(toMapKey(key, gameId), requestQueue);
    return inputPromise.promise;
  }
}

const toMapKey = (key: InputKey, gameId: string) =>
  JSON.stringify({ key, gameId });
