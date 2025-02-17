export interface OutputEvent<Payload> {
  type: string;
  payload?: Payload;
}

export interface ExitEvent extends OutputEvent<void> {
  type: 'exit';
}
