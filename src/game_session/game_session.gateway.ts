import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';

@WebSocketGateway()
export class GameSessionGateway {
  @SubscribeMessage('scene')
  handleMessage(@MessageBody() data: string): string {
    console.log(data);
    return 'New scene';
  }
}
