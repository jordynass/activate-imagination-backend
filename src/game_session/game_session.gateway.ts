import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { BadRequestException } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AppService } from 'src/app.service';
import {
  SceneSchema,
  StorySchema,
  type SceneDto,
  type StoryDto,
} from 'src/lang_graph/entities/io';
import { AsyncInputService, InputKey } from 'src/shared/async_input.service';
import { ClientService } from 'src/shared/client.service';
import { OutputService } from 'src/shared/output.service';

@WebSocketGateway()
export class GameSessionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly appService: AppService,
    private readonly outputService: OutputService,
    private readonly asyncInputService: AsyncInputService,
    private readonly clientService: ClientService,
  ) {}

  handleConnection(@ConnectedSocket() client: Socket) {
    const gameId = client.handshake.headers['x-game-id'];
    if (typeof gameId !== 'string') {
      const errorMsg = `Invalid x-game-id header: ${JSON.stringify(gameId)}.\nShould be a string`;
      client.emit('error', errorMsg);
      throw new BadRequestException(gameId, errorMsg);
    }
    this.clientService.setClient(gameId, client);
    this.outputService.setSocket(client);
    console.log(
      `Connected to client: ${client.id} at ${new Date().toLocaleTimeString()}`,
    );
  }

  handleDisconnect(client: any) {
    console.log(
      `Disconnected from client: ${client.id} at ${new Date().toLocaleTimeString()}`,
    );
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

  @SubscribeMessage('action')
  handleAction(@MessageBody() data: string) {
    this.asyncInputService.sendInput(data, InputKey.ACTION);
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
