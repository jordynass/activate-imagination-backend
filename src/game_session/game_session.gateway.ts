import {
  WebSocketGateway,
  OnGatewayConnection,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { AppService } from 'src/app.service';
import {
  SceneSchema,
  StorySchema,
  type SceneDto,
  type StoryDto,
} from 'src/lang_graph/entities/io';

@WebSocketGateway()
export class GameSessionGateway implements OnGatewayConnection {
  constructor(private readonly appService: AppService) {}

  handleConnection() {
    return 'Connected';
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

    const stroyData: StoryDto = validation.data;
    console.log(
      'Received valid story data:',
      stringifyWithTruncation(stroyData),
    );
    return 'New game';
  }
}

function stringifyWithTruncation(obj: object) {
  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === 'string' && value.length > 50) {
        return value.substring(0, 50) + '...';
      }
      return value;
    },
    2,
  );
}
