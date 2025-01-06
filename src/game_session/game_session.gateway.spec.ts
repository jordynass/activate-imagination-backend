import { Test, TestingModule } from '@nestjs/testing';
import { GameSessionGateway } from './game_session.gateway';
import { TEST_ONLY } from './game_session.gateway';
import { AppService } from 'src/app.service';
import { OutputService } from 'src/output_service/output.service';
import { SceneDto, StoryDto } from 'src/lang_graph/entities/io';

const mockAppService = { startGame: jest.fn() };
const mockOutputService = { setSocket: jest.fn() };

describe('GameSessionGateway', () => {
  let gateway: GameSessionGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameSessionGateway,
        { provide: AppService, useValue: mockAppService },
        { provide: OutputService, useValue: mockOutputService },
      ],
    }).compile();

    gateway = module.get<GameSessionGateway>(GameSessionGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should set socket on handleConnection', () => {
    const socket = {} as any;
    gateway.handleConnection(socket);
    expect(mockOutputService.setSocket).toHaveBeenCalledWith(socket);
  });

  it('should validate and handle new scene correctly', () => {
    const validScene: SceneDto = {
      photo: 'data:image/png;base64,VALIDBASE64STRING',
    };
    const invalidScene = { photo: 'INVALIDBASE64STRING' };

    const validResult = gateway.handleNewScene(validScene);
    expect(validResult).toBe('New scene');

    const invalidResult = gateway.handleNewScene(invalidScene as any);
    expect(invalidResult).toContain('Invalid scene data');
  });

  it('should validate and handle new game correctly', () => {
    const validStory: StoryDto = {
      storyPrompt: 'Once upon a time...',
      photo: 'data:image/png;base64,VALIDBASE64STRING',
    };
    const invalidStory = {
      storyPrompt: 'Once upon a time...',
      photo: 'INVALIDBASE64STRING',
    };

    const validResult = gateway.handleNewGame(validStory);
    expect(validResult).toBe('New game');

    const invalidResult = gateway.handleNewGame(invalidStory as any);
    expect(invalidResult).toContain('Invalid story data');
  });

  it('should call startGame on new game', () => {
    const story: StoryDto = {
      storyPrompt: 'Once upon a time...',
      photo: 'data:image/png;base64,VALIDBASE64STRING',
    };

    gateway.handleNewGame(story);
    expect(mockAppService.startGame).toHaveBeenCalledWith(story);
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
