import {
  WebSocketGateway,
  OnGatewayConnection,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AppService } from 'src/app.service';
import {
  SceneSchema,
  StorySchema,
  type SceneDto,
  type StoryDto,
} from 'src/lang_graph/entities/io';
import { OutputService } from 'src/output_service';

@WebSocketGateway()
export class GameSessionGateway implements OnGatewayConnection {
  constructor(
    private readonly appService: AppService,
    private readonly outputService: OutputService,
  ) {}

  handleConnection(@ConnectedSocket() client: Socket) {
    this.outputService.setSocket(client);
    console.log(`Connected to client: ${client.id}`);
  }

  @SubscribeMessage('newScene')
  handleNewScene(@MessageBody() data: SceneDto): string {
    const validation = SceneSchema.safeParse(data);

    if (!validation.success) {
      console.error('New Scene Validation failed:', validation.error.errors);
      return `Invalid scene data: ${validation.error.errors.map((e) => e.message).join('\n')}`;
    }

    const sceneData: SceneDto = validation.data;
    console.log(
      'Received valid scene data:',
      stringifyWithTruncation(sceneData),
    );
    return 'New scene';
  }

  @SubscribeMessage('newGame')
  handleNewGame(@MessageBody() data: StoryDto): string {
    const validation = StorySchema.safeParse(data);
    if (!validation.success) {
      console.error('New Game Validation failed:', validation.error.errors);
      return `Invalid story data: ${validation.error.errors.map((e) => e.message).join('\n')}`;
    }

    const storyData: StoryDto = validation.data;
    console.log(
      'Received valid story data:',
      stringifyWithTruncation(storyData),
    );

    this.appService.startGame(storyData);
    return 'New game';
  }
}

function stringifyWithTruncation(obj: object, maxStringLength = 50): string {
  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === 'string' && value.length > maxStringLength) {
        return value.substring(0, maxStringLength) + '...';
      }
      return value;
    },
    2,
  );
}

export const TEST_ONLY = { stringifyWithTruncation };
