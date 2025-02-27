import { Test, TestingModule } from '@nestjs/testing';
import { GameSessionGateway } from './game_session.gateway';
import { TEST_ONLY } from './game_session.gateway';
import { AppService } from 'src/app.service';
import { OutputService } from 'src/shared/output.service';
import { SceneDto, StoryDto } from 'src/lang_graph/entities/io';
import { AsyncInputService } from 'src/shared/async_input.service';
import { InputKey } from 'src/lang_graph/entities/input_events';

import { ClientService } from 'src/shared/client.service';

describe('GameSessionGateway', () => {
  async function setup() {
    const mockAppService = { startGame: jest.fn() };
    const mockOutputService = { setSocket: jest.fn() };
    const mockAsyncInputService = { sendInput: jest.fn() };
    const mockClientService = { setClient: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameSessionGateway,
        { provide: AppService, useValue: mockAppService },
        { provide: OutputService, useValue: mockOutputService },
        { provide: AsyncInputService, useValue: mockAsyncInputService },
        { provide: ClientService, useValue: mockClientService },
      ],
    }).compile();

    const gateway = module.get<GameSessionGateway>(GameSessionGateway);
    jest.clearAllMocks();
    return {
      gateway,
      mockAppService,
      mockOutputService,
      mockAsyncInputService,
      mockClientService,
    };
  }

  it('should be defined', async () => {
    const { gateway } = await setup();
    expect(gateway).toBeDefined();
  });

  it('should validate and handle new scene correctly', async () => {
    const { gateway } = await setup();
    const validScene: SceneDto = {
      photo: '//VALIDBASE64STRING//',
      gameId: 'valid-game',
    };
    const invalidScene = {
      photo: '--INVALIDBASE64STRING--',
      gameId: 'invalid-game',
    };

    const validResult = gateway.handleNewScene(validScene);
    expect(validResult).toBe('New scene');

    const invalidResult = gateway.handleNewScene(invalidScene);
    expect(invalidResult).toContain('Invalid scene data');
  });

  it('should validate and handle new game correctly', async () => {
    const { gateway } = await setup();
    const validStory: StoryDto = {
      storyPrompt: 'Once upon a time...',
      photo: '//VALIDBASE64STRING//',
      gameId: 'valid-game',
    };
    const invalidStory: StoryDto = {
      storyPrompt: 'Once upon a time...',
      photo: '--INVALIDBASE64STRING--',
      gameId: 'invalid-game',
    };
    const client = { id: 'client123' } as any;

    const validResult = gateway.handleNewGame(validStory, client);
    expect(validResult).toBe('New game');

    const invalidResult = gateway.handleNewGame(invalidStory, client);
    expect(invalidResult).toContain('Invalid story data');
  });

  it('should set client if and only if a valid story prompt is passed', async () => {
    const { gateway, mockClientService } = await setup();
    const validStory: StoryDto = {
      storyPrompt: 'Once upon a time...',
      photo: '//VALIDBASE64STRING//',
      gameId: 'valid-game',
    };
    const invalidStory: StoryDto = {
      storyPrompt: 'Once upon a time...',
      photo: '--INVALIDBASE64STRING--',
      gameId: 'invalid-game',
    };
    const client1 = { id: 'client123' } as any;
    const client2 = { id: 'client456' } as any;

    gateway.handleNewGame(invalidStory, client2);
    gateway.handleNewGame(validStory, client1);

    expect(mockClientService.setClient).toHaveBeenCalledTimes(1);
    expect(mockClientService.setClient).toHaveBeenCalledWith(
      'valid-game',
      client1,
    );
  });

  it('should call startGame on new game', async () => {
    const { gateway, mockAppService } = await setup();
    const story: StoryDto = {
      storyPrompt: 'Once upon a time...',
      photo: '//VALIDBASE64STRING//',
      gameId: 'game123',
    };
    const client = { id: 'client123' } as any;

    gateway.handleNewGame(story, client);
    expect(mockAppService.startGame).toHaveBeenCalledWith(story);
  });

  it('should send input on action', async () => {
    const { gateway, mockAsyncInputService } = await setup();
    const action = {
      text: 'I will look under the small rock',
      gameId: 'game123',
    };

    gateway.handleAction(action);
    expect(mockAsyncInputService.sendInput).toHaveBeenCalledWith(
      action,
      InputKey.ACTION,
    );
  });
});

describe('stringifyWithTruncation helper', () => {
  const { stringifyWithTruncation } = TEST_ONLY;

  it('should truncate long strings', () => {
    const longString = 'a'.repeat(6);
    expect(stringifyWithTruncation({ longString }, 5)).toEqual(`{
  "longString": "aaaaa..."
}`);
  });

  it('should preserve short strings', () => {
    const shortString = 'a'.repeat(5);
    expect(stringifyWithTruncation({ shortString }, 5)).toEqual(`{
  "shortString": "aaaaa"
}`);
  });
});
