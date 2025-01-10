import { Test, TestingModule } from '@nestjs/testing';
import { GameSessionGateway } from './game_session.gateway';
import { TEST_ONLY } from './game_session.gateway';
import { AppService } from 'src/app.service';
import { OutputService } from 'src/shared/output.service';
import { SceneDto, StoryDto } from 'src/lang_graph/entities/io';
import { AsyncInputService, InputKey } from 'src/shared/async_input.service';

describe('GameSessionGateway', () => {
  async function setup() {
    const mockAppService = { startGame: jest.fn() };
    const mockOutputService = { setSocket: jest.fn() };
    const mockAsyncInputService = { sendInput: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameSessionGateway,
        { provide: AppService, useValue: mockAppService },
        { provide: OutputService, useValue: mockOutputService },
        { provide: AsyncInputService, useValue: mockAsyncInputService },
      ],
    }).compile();

    const gateway = module.get<GameSessionGateway>(GameSessionGateway);
    jest.clearAllMocks();
    return {
      gateway,
      mockAppService,
      mockOutputService,
      mockAsyncInputService,
    };
  }

  it('should be defined', async () => {
    const { gateway } = await setup();
    expect(gateway).toBeDefined();
  });

  it('should set socket on handleConnection', async () => {
    const { gateway, mockOutputService } = await setup();
    const socket = {} as any;
    gateway.handleConnection(socket);
    expect(mockOutputService.setSocket).toHaveBeenCalledWith(socket);
  });

  it('should validate and handle new scene correctly', async () => {
    const { gateway } = await setup();
    const validScene: SceneDto = {
      photo: '//VALIDBASE64STRING//',
    };
    const invalidScene = { photo: '--INVALIDBASE64STRING--' };

    const validResult = gateway.handleNewScene(validScene);
    expect(validResult).toBe('New scene');

    const invalidResult = gateway.handleNewScene(invalidScene as any);
    expect(invalidResult).toContain('Invalid scene data');
  });

  it('should validate and handle new game correctly', async () => {
    const { gateway } = await setup();
    const validStory: StoryDto = {
      storyPrompt: 'Once upon a time...',
      photo: '//VALIDBASE64STRING//',
    };
    const invalidStory = {
      storyPrompt: 'Once upon a time...',
      photo: '--INVALIDBASE64STRING--',
    };

    const validResult = gateway.handleNewGame(validStory);
    expect(validResult).toBe('New game');

    const invalidResult = gateway.handleNewGame(invalidStory as any);
    expect(invalidResult).toContain('Invalid story data');
  });

  it('should call startGame on new game', async () => {
    const { gateway, mockAppService } = await setup();
    const story: StoryDto = {
      storyPrompt: 'Once upon a time...',
      photo: '//VALIDBASE64STRING//',
    };

    gateway.handleNewGame(story);
    expect(mockAppService.startGame).toHaveBeenCalledWith(story);
  });

  it('should send input on action', async () => {
    const { gateway, mockAsyncInputService } = await setup();
    const action = 'I will look under the small rock';

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
