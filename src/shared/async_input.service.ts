import { Injectable } from '@nestjs/common';
import { ActionDto } from 'src/lang_graph/entities/io';

@Injectable()
export class AsyncInputService {
  private inputQueueMap = new Map<string, string[]>();
  private requestQueueMap = new Map<string, PromiseWithResolvers<string>[]>();

  sendInput({ text, gameId }: ActionDto, key: InputKey) {
    const requestQueue = this.requestQueueMap.get(toMapKey(key, gameId)) ?? [];
    const inputQueue = this.inputQueueMap.get(toMapKey(key, gameId)) ?? [];
    if (requestQueue.length > 0) {
      const { resolve } = requestQueue.shift();
      resolve(text);
    } else {
      inputQueue.push(text);
      this.inputQueueMap.set(toMapKey(key, gameId), inputQueue);
    }
  }

  async requestInput(key: InputKey, gameId: string): Promise<string> {
    const requestQueue = this.requestQueueMap.get(toMapKey(key, gameId)) ?? [];
    const inputQueue = this.inputQueueMap.get(toMapKey(key, gameId)) ?? [];
    if (inputQueue.length > 0) {
      return inputQueue.shift();
    }
    const inputPromise = Promise.withResolvers<string>();
    requestQueue.push(inputPromise);
    this.requestQueueMap.set(toMapKey(key, gameId), requestQueue);
    return inputPromise.promise;
  }
}

const toMapKey = (key: InputKey, gameId: string) =>
  JSON.stringify({ key, gameId });

export enum InputKey {
  ACTION,
  UNKNOWN,
}
