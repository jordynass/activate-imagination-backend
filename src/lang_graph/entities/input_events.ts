export enum InputKey {
  ACTION,
  NEW_SCENE,
}

export interface InputEvent<Payload> {
  key: InputKey;
  gameId: string;
  payload: Payload;
}
