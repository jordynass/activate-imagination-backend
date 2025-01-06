import {
  WebSocketGateway,
  OnGatewayConnection,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { AppService } from 'src/app.service';
import { type SceneDto, type StoryDto } from 'src/lang_graph/entities/io';

@WebSocketGateway()
export class GameSessionGateway implements OnGatewayConnection {
  constructor(private readonly appService: AppService) {}

  handleConnection() {
    return 'Connected';
  }

  @SubscribeMessage('newScene')
  @UsePipes(new ValidationPipe({ transform: true }))
  handleNewScene(@MessageBody() data: SceneDto): string {
    console.log(data);
    return 'New scene';
  }

  @SubscribeMessage('newGame')
  @UsePipes(new ValidationPipe({ transform: true }))
  handleNewGame(@MessageBody() data: StoryDto): string {
    console.log(data);
    return 'New game';
  }
}
