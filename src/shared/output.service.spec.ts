import { Test, TestingModule } from '@nestjs/testing';
import { OutputService } from './output.service';
import { ClientService } from './client.service';
import { Socket } from 'socket.io';
import { InputKey } from './async_input.service';

describe('OutputService', () => {
  async function setup() {
    const mockSocket1 = { emit: jest.fn() } as unknown as Socket;
    const mockSocket2 = { emit: jest.fn() } as unknown as Socket;

    const mockClientService = {
      getClient: jest
        .fn()
        .mockImplementation((gameId: string) =>
          gameId === 'game123' ? mockSocket1 : mockSocket2,
        ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutputService,
        { provide: ClientService, useValue: mockClientService },
      ],
    }).compile();

    const service = module.get<OutputService>(OutputService);
    jest.clearAllMocks();
    return { service, mockSocket1, mockSocket2, mockClientService };
  }

  it('should be defined', async () => {
    const { service } = await setup();
    expect(service).toBeDefined();
  });

  describe('stream', () => {
    it('should emit output', async () => {
      const { service, mockSocket1 } = await setup();

      service.stream('chunk1', 'game123');
      service.stream('chunk2', 'game123');

      expect(mockSocket1.emit).toHaveBeenCalledWith('output', {
        content: 'chunk1',
        order: 0,
      });
      expect(mockSocket1.emit).toHaveBeenCalledWith('output', {
        content: 'chunk2',
        order: 1,
      });
    });

    it('should store chunks by gameId', async () => {
      const { service } = await setup();

      service.stream('chunk1', 'game123');
      service.stream('chunk2', 'game123');

      const chunks = service['chunksByGameId'].get('game123');
      expect(chunks).toEqual(['chunk1', 'chunk2']);
    });

    it('should not affect other games when streaming', async () => {
      const { service, mockSocket1, mockSocket2 } = await setup();

      service.stream('chunk1', 'game123');
      service.stream('chunk3', 'game456');
      service.stream('chunk2', 'game123');
      service.stream('chunk4', 'game456');

      expect(mockSocket1.emit).toHaveBeenCalledWith('output', {
        content: 'chunk1',
        order: 0,
      });
      expect(mockSocket1.emit).toHaveBeenCalledWith('output', {
        content: 'chunk2',
        order: 1,
      });
      expect(mockSocket2.emit).toHaveBeenCalledWith('output', {
        content: 'chunk3',
        order: 0,
      });
      expect(mockSocket2.emit).toHaveBeenCalledWith('output', {
        content: 'chunk4',
        order: 1,
      });

      const chunksGame123 = service['chunksByGameId'].get('game123');
      const chunksGame456 = service['chunksByGameId'].get('game456');
      expect(chunksGame123).toEqual(['chunk1', 'chunk2']);
      expect(chunksGame456).toEqual(['chunk3', 'chunk4']);
    });
  });

  describe('endStream', () => {
    it('should emit endOutput with length and input key', async () => {
      const { service, mockSocket1 } = await setup();

      service.stream('chunk1', 'game123');
      service.stream('chunk2', 'game123');

      service.endStream('game123', InputKey.ACTION);
      expect(mockSocket1.emit).toHaveBeenCalledWith('endOutput', {
        length: 2,
        responseKey: InputKey.ACTION,
      });
    });

    it('should return joined chunks', async () => {
      const { service } = await setup();

      service.stream('chunk1', 'game123');
      service.stream('chunk2', 'game123');

      const result = service.endStream('game123', InputKey.ACTION);
      expect(result).toBe('chunk1chunk2');
    });

    it('should clear chunks for the specified gameId', async () => {
      const { service } = await setup();

      service.stream('chunk1', 'game123');
      service.stream('chunk2', 'game123');

      const result1 = service.endStream('game123', InputKey.ACTION);
      expect(result1).toBe('chunk1chunk2');

      const result2 = service.endStream('game123', InputKey.ACTION);
      expect(result2).toBe('');
    });

    it('should not affect other games when ending stream', async () => {
      const { service, mockSocket1, mockSocket2 } = await setup();

      service.stream('chunk1', 'game123');
      service.stream('chunk3', 'game456');
      service.stream('chunk2', 'game123');
      service.stream('chunk4', 'game456');
      service.stream('chunk5', 'game123');

      const result1 = service.endStream('game123', InputKey.ACTION);
      const result2 = service.endStream('game456', InputKey.ACTION);

      expect(mockSocket1.emit).toHaveBeenCalledWith('endOutput', {
        length: 3,
        responseKey: InputKey.ACTION,
      });
      expect(mockSocket2.emit).toHaveBeenCalledWith('endOutput', {
        length: 2,
        responseKey: InputKey.ACTION,
      });

      expect(result1).toBe('chunk1chunk2chunk5');
      expect(result2).toBe('chunk3chunk4');
    });
  });

  describe('sendEvent', () => {
    it('should emit the event to the correct client and not to the wrong client', async () => {
      const { service, mockSocket1, mockSocket2, mockClientService } =
        await setup();
      const gameId = 'game123';
      const outputEvent = { type: 'testEvent', payload: { data: 'testData' } };

      service.sendEvent(outputEvent, gameId);

      expect(mockClientService.getClient).toHaveBeenCalledWith(gameId);
      expect(mockSocket1.emit).toHaveBeenCalledWith(
        outputEvent.type,
        outputEvent.payload,
      );
      expect(mockSocket2.emit).not.toHaveBeenCalled();
    });
  });
});
