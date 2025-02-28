export enum InputKey {
  ACTION = 'action',
  NEW_SCENE = 'newScene',
}

export interface InputEvent<Payload> {
  key: InputKey;
  gameId: string;
  payload: Payload;
}
