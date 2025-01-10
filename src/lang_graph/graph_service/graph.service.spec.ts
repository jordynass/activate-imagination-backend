import { Test, TestingModule } from '@nestjs/testing';
import { GraphService, TEST_ONLY } from './graph.service';
import { OutputService } from 'src/shared/output.service';
import { AsyncInputService, InputKey } from 'src/shared/async_input.service';
import { AIMessageChunk, HumanMessage } from '@langchain/core/messages';
import { Command } from '@langchain/langgraph';

// jest.mock('@langchain/core/messages', () => ({
//   isAIMessageChunk: jest.fn(),
// }));

jest.mock('src/lang_graph/nodes/prepare_input_node', () => ({
  prepareInputNode: jest.fn(),
}));

describe('GraphService', () => {
  async function setup() {
    const mockOutputService = { stream: jest.fn(), endStream: jest.fn() };
    const mockAsyncInputService = { requestInput: jest.fn() };
    // const mockIsAIMessageChunk = jest.requireMock(
    //   '@langchain/core/messages',
    // ).isAIMessageChunk;
    const mockPrepareInputNode = jest.requireMock(
      'src/lang_graph/nodes/prepare_input_node',
    ).prepareInputNode;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GraphService,
        { provide: OutputService, useValue: mockOutputService },
        { provide: AsyncInputService, useValue: mockAsyncInputService },
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
    // mockIsAIMessageChunk.mockImplementation((msg) => msg.type === 'ai');
    mockPrepareInputNode.mockResolvedValue({});
    jest.spyOn<any, any>(service, 'buildGraph').mockReturnValue(mockGraph);

    jest.clearAllMocks();
    return {
      service,
      mockOutputService,
      mockPrepareInputNode,
      mockGraph,
      // mockIsAIMessageChunk,
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

      await service.startGame(mockInput);

      expect(mockPrepareInputNode).toHaveBeenCalledWith(mockInput);
    });

    it('should store configs', async () => {
      const { service } = await setup();
      const mockInput = {};

      await service.startGame(mockInput);
      await service.startGame(mockInput);

      expect(service['configs']).toHaveLength(2);
    });

    it('should send ai messages to outputService', async () => {
      const { service, mockOutputService } = await setup();
      const mockInput = {};

      await service.startGame(mockInput);

      expect(mockOutputService.stream).toHaveBeenCalledWith('chunk1');
      expect(mockOutputService.stream).toHaveBeenCalledWith('chunk2');
    });

    it('should only send ai messages to outputService', async () => {
      const { service, mockOutputService } = await setup();
      const mockInput = {};

      await service.startGame(mockInput);

      expect(mockOutputService.stream).not.toHaveBeenCalledWith('bar');
    });

    it('should end stream after all messages', async () => {
      const { service, mockOutputService } = await setup();
      const mockInput = {};

      await service.startGame(mockInput);

      expect(mockOutputService.endStream).toHaveBeenCalled();
    });

    it('should stream graph again if state has a next node', async () => {
      const { service, mockOutputService, mockGraph } = await setup();
      mockGraph.getState.mockReturnValueOnce({ next: ['fooNode'] });
      mockGraph.getState.mockReturnValueOnce({ next: ['barNode'] });
      mockGraph.getState.mockReturnValue({ next: [] });

      await service.startGame({});

      expect(mockGraph.stream).toHaveBeenCalledTimes(3);
      expect(mockOutputService.endStream).toHaveBeenCalledTimes(3);
    });

    it('should request action input for heroNode', async () => {
      const { service, mockAsyncInputService, mockGraph } = await setup();
      mockGraph.getState.mockReturnValueOnce({ next: ['heroNode'] });
      mockGraph.getState.mockReturnValue({ next: [] });
      mockAsyncInputService.requestInput.mockReturnValue(
        'I shall duck behind that little garbage car.',
      );

      await service.startGame({});

      expect(mockAsyncInputService.requestInput).toHaveBeenCalledWith(
        InputKey.ACTION,
      );
    });

    it('should pass action input to graph stream for heroNode', async () => {
      const { service, mockAsyncInputService, mockGraph } = await setup();
      mockGraph.getState.mockReturnValueOnce({ next: ['heroNode'] });
      mockGraph.getState.mockReturnValue({ next: [] });
      mockAsyncInputService.requestInput.mockReturnValue(
        'I shall duck behind that little garbage car.',
      );

      await service.startGame({});

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
    const result = toConfig(42);
    expect(result).toEqual({
      configurable: { thread_id: '42' },
      streamMode: 'messages',
    });
  });
});
