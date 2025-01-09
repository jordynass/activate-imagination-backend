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
    }
  }

  async requestInput(key: InputKey): Promise<string> {
    const requestQueue = this.requestQueueByKey.get(key) ?? [];
    const inputQueue = this.inputQueueByKey.get(key) ?? [];
    if (inputQueue.length > 0) {
      return Promise.resolve(inputQueue.shift());
    }
    const inputPromise = Promise.withResolvers<string>();
    requestQueue.push(inputPromise);
    return inputPromise.promise;
  }
}

export enum InputKey {
  'ACTION',
}
