import { Injectable } from '@nestjs/common';

@Injectable()
export class AsyncInputService {
  private inputQueueByKey = new Map<InputKey, string[]>();
  private requestQueueByKey = new Map<
    InputKey,
    PromiseWithResolvers<string>[]
  >();

  sendInput(input: string, key: InputKey) {
    const requestQueue = this.requestQueueByKey.get(key) ?? [];
    const inputQueue = this.inputQueueByKey.get(key) ?? [];
    if (requestQueue.length > 0) {
      const { resolve } = requestQueue.shift();
      resolve(input);
    } else {
      inputQueue.push(input);
      this.inputQueueByKey.set(key, inputQueue);
    }
  }

  async requestInput(key: InputKey): Promise<string> {
    const requestQueue = this.requestQueueByKey.get(key) ?? [];
    const inputQueue = this.inputQueueByKey.get(key) ?? [];
    if (inputQueue.length > 0) {
      return inputQueue.shift();
    }
    const inputPromise = Promise.withResolvers<string>();
    requestQueue.push(inputPromise);
    this.requestQueueByKey.set(key, requestQueue);
    return inputPromise.promise;
  }
}

export enum InputKey {
  ACTION,
  UNKNOWN,
}
