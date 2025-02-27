import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

/**
 * Service for tracking client sockets. It is in a self-contained service to
 * make it more flexible for game session models moving forward (e.g. multiple
 * players in one game, multiple games on one device).
 */
@Injectable()
export class ClientService {
  private readonly clientMap = new Map<string, Socket>();

  /** @returns Whether the game is new, as opposed to already in progress. */
  setClient(gameId: string, client: Socket): boolean {
    const isNewGame = !this.clientMap.has(gameId);
    this.clientMap.set(gameId, client);
    return isNewGame;
  }

  getClient(gameId: string): Socket | undefined {
    if (!this.clientMap.has(gameId)) {
      console.error(
        `Game ID ${gameId} has not been set so there is no client to return`,
      );
    }
    return this.clientMap.get(gameId);
  }
}
