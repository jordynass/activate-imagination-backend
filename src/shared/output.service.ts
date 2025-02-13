import { Injectable } from '@nestjs/common';
import { ClientService } from './client.service';

@Injectable()
export class OutputService {
  private chunksByGameId = new Map<string, string[]>();

  constructor(private clientService: ClientService) {}

  stream(chunk: string, gameId: string) {
    const client = this.clientService.getClient(gameId);
    if (!client) {
      console.error(`There is no running game with ID ${gameId} `);
      return;
    }
    const chunks = this.chunksByGameId.get(gameId) ?? [];
    client.emit('output', {
      content: chunk,
      order: chunks.length,
    });
    chunks.push(chunk);
    this.chunksByGameId.set(gameId, chunks);
  }

  endStream(gameId: string): string {
    const chunks = this.chunksByGameId.get(gameId) ?? [];
    if (chunks.length > 0) {
      console.log(`Ending stream of ${chunks.length} chunks`);
    }
    this.clientService.getClient(gameId)?.emit('endOutput', chunks.length);
    const output = chunks.join('');
    this.chunksByGameId.set(gameId, []);
    return output;
  }
}
