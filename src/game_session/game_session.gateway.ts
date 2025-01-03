import {
  WebSocketGateway,
  OnGatewayConnection,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { AppService } from 'src/app.service';

@WebSocketGateway()
export class GameSessionGateway implements OnGatewayConnection {
  private gameGraph = null;
  constructor(private readonly appService: AppService) {}

  handleConnection() {
    if (this.gameGraph) {
      // TODO: Handle reconnection
    }
    this.gameGraph = this.appService.startGame(
      'I am exploring the ocean for sunken treasure.',
    );
  }

  @SubscribeMessage('scene')
  handleMessage(@MessageBody() data: string): string {
    console.log(data);
    return 'New scene';
  }
}
