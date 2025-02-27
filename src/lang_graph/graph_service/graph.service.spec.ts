import { Test, TestingModule } from '@nestjs/testing';
import { GraphService, TEST_ONLY } from './graph.service';
import { OutputService } from 'src/shared/output.service';
import { AsyncInputService } from 'src/shared/async_input.service';
import { InputKey } from 'src/lang_graph/entities/input_events';
import { AIMessageChunk, HumanMessage } from '@langchain/core/messages';
import { Command } from '@langchain/langgraph';

jest.mock('src/lang_graph/nodes/prepare_input_node', () => ({
  prepareInputNode: jest.fn(),
}));

describe('GraphService', () => {
  async function setup() {
    const mockOutputService = { stream: jest.fn(), endStream: jest.fn() };
    const mockAsyncInputService = { requestInput: jest.fn() };
    const mockPrepareInputNode = jest.requireMock(
      'src/lang_graph/nodes/prepare_input_node',
    ).prepareInputNode;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GraphService,
        { provide: OutputService, useValue: mockOutputService },
        { provide: AsyncInputService, useValue: mockAsyncInputService },
        { provide: 'TOOLS', useValue: [] },
        { provide: 'GAME_MASTER_NODE', useValue: jest.fn() },
      ],
    }).compile();

    const service = module.get<GraphService>(GraphService);
    const mockGraph = {
      stream: jest.fn().mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          yield [new AIMessageChunk('chunk1')];
          yield [new HumanMessage('foo')];
          yield [new AIMessageChunk('chunk2')];
        },
      }),
      getState: jest.fn(),
      getStateHistory: jest.fn(),
    };
    mockGraph.getState.mockReturnValue({ next: null });
    mockPrepareInputNode.mockResolvedValue({});
    jest.spyOn<any, any>(service, 'buildGraph').mockReturnValue(mockGraph);

    jest.clearAllMocks();
    return {
      service,
      mockOutputService,
      mockPrepareInputNode,
      mockGraph,
      mockAsyncInputService,
    };
  }

  it('should be defined', async () => {
    const { service } = await setup();
    expect(service).toBeDefined();
  });

  describe('startGame', () => {
    it('should pass input to prepareInputNode', async () => {
      const { service, mockPrepareInputNode } = await setup();
      const mockInput = {};

      await service.startGame(mockInput as any);

      expect(mockPrepareInputNode).toHaveBeenCalledWith(mockInput);
    });

    it('should track multiple configs', async () => {
      const { service } = await setup();
      const mockInput = {};

      await service.startGame(mockInput as any);
      await service.startGame(mockInput as any);

      expect(service['configs']).toHaveLength(2);
    });

    it('should use gameId for config', async () => {
      const { service } = await setup();
      const mockInput = { gameId: 'game123' };

      await service.startGame(mockInput as any);

      expect(service['configs'][0].configurable.thread_id).toBe('game123');
    });

    it('should send ai messages to outputService', async () => {
      const { service, mockOutputService } = await setup();
      const mockInput = { gameId: 'game123' };

      await service.startGame(mockInput as any);

      expect(mockOutputService.stream).toHaveBeenCalledWith(
        'chunk1',
        expect.any(String),
      );
      expect(mockOutputService.stream).toHaveBeenCalledWith(
        'chunk2',
        expect.any(String),
      );
    });

    it('should pass gameId to outputService', async () => {
      const { service, mockOutputService } = await setup();
      const mockInput = { gameId: 'game123' };

      await service.startGame(mockInput as any);

      expect(mockOutputService.stream).toHaveBeenCalledWith(
        'chunk1',
        'game123',
      );
      expect(mockOutputService.stream).toHaveBeenCalledWith(
        'chunk2',
        'game123',
      );
    });

    it('should only send ai messages to outputService', async () => {
      const { service, mockOutputService } = await setup();

      await service.startGame({} as any);

      expect(mockOutputService.stream).not.toHaveBeenCalledWith('foo');
    });

    it('should end stream with ACTION input key for heroActionNode', async () => {
      const { service, mockAsyncInputService, mockOutputService, mockGraph } =
        await setup();
      mockGraph.getState.mockReturnValueOnce({ next: ['heroActionNode'] });
      mockAsyncInputService.requestInput.mockReturnValue(
        'I shall duck behind that little garbage car.',
      );

      await service.startGame({ gameId: 'game123' } as any);

      expect(mockOutputService.endStream).toHaveBeenCalledWith(
        'game123',
        InputKey.ACTION,
      );
    });

    it('should end stream with NEW_SCENE input key for heroSceneNode', async () => {
      const { service, mockAsyncInputService, mockOutputService, mockGraph } =
        await setup();
      mockGraph.getState.mockReturnValueOnce({ next: ['heroSceneNode'] });
      mockAsyncInputService.requestInput.mockReturnValue('base64-image-string');

      await service.startGame({ gameId: 'game123' } as any);

      expect(mockOutputService.endStream).toHaveBeenCalledWith(
        'game123',
        InputKey.NEW_SCENE,
      );
    });

    it('should stream graph again after each hero response', async () => {
      const { service, mockAsyncInputService, mockOutputService, mockGraph } =
        await setup();
      mockGraph.getState.mockReturnValueOnce({ next: ['heroActionNode'] });
      mockGraph.getState.mockReturnValueOnce({ next: ['heroSceneNode'] });
      mockGraph.getState.mockReturnValue({ next: [] });
      mockAsyncInputService.requestInput.mockReturnValue(
        'Text or a base64 image',
      );

      await service.startGame({} as any);

      expect(mockGraph.stream).toHaveBeenCalledTimes(3);
      expect(mockOutputService.endStream).toHaveBeenCalledTimes(2);
    });

    it('should request action input for heroActionNode', async () => {
      const { service, mockAsyncInputService, mockGraph } = await setup();
      mockGraph.getState.mockReturnValueOnce({ next: ['heroActionNode'] });
      mockGraph.getState.mockReturnValue({ next: [] });
      mockAsyncInputService.requestInput.mockReturnValue(
        'I shall duck behind that little garbage car.',
      );

      await service.startGame({ gameId: 'game123' } as any);

      expect(mockAsyncInputService.requestInput).toHaveBeenCalledWith(
        InputKey.ACTION,
        expect.any(String),
      );
    });

    it('should pass action input to graph stream for heroNode', async () => {
      const { service, mockAsyncInputService, mockGraph } = await setup();
      mockGraph.getState.mockReturnValueOnce({ next: ['heroNode'] });
      mockGraph.getState.mockReturnValue({ next: [] });
      mockAsyncInputService.requestInput.mockReturnValue(
        'I shall duck behind that little garbage car.',
      );

      await service.startGame({} as any);

      expect(
        mockGraph.stream.mock.calls.some((argList) => {
          const mainArg = argList[0];
          return (
            mainArg instanceof Command &&
            mainArg.resume.content ===
              'I shall duck behind that little garbage car.'
          );
        }),
      );
    });
  });
});

describe('toConfig helper', () => {
  it('should return correct config', () => {
    const { toConfig } = TEST_ONLY;
    const result = toConfig('game123');
    expect(result).toEqual({
      configurable: { thread_id: 'game123' },
      streamMode: 'messages',
    });
  });
});
