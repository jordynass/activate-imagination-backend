import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class OutputService {
  private chunks: string[] = [];
  private socket: Socket | null = null;

  setSocket(socket: Socket) {
    this.socket = socket;
  }

  stream(chunk: string) {
    if (!this.socket) {
      console.error(
        `Socket has not been set yet so OutputService cannot stream`,
      );
      return;
    }
    this.socket.emit('output', {
      content: chunk,
      order: this.chunks.length,
    });
    this.chunks.push(chunk);
  }

  endStream(): string {
    if (this.chunks.length > 0) {
      console.log(`Ending stream of ${this.chunks.length} chunks`);
    }
    this.socket?.emit('endOutput', this.chunks.length);
    const output = this.chunks.join('');
    this.chunks = [];
    return output;
  }
}
