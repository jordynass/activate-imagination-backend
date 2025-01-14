import { Test, TestingModule } from '@nestjs/testing';
import { OutputService } from './output.service';
import { ClientService } from './client.service';
import { Socket } from 'socket.io';

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
    it('should emit endOutput', async () => {
      const { service, mockSocket1 } = await setup();

      service.stream('chunk1', 'game123');
      service.stream('chunk2', 'game123');

      service.endStream('game123');
      expect(mockSocket1.emit).toHaveBeenCalledWith('endOutput', 2);
    });

    it('should return joined chunks', async () => {
      const { service } = await setup();

      service.stream('chunk1', 'game123');
      service.stream('chunk2', 'game123');

      const result = service.endStream('game123');
      expect(result).toBe('chunk1chunk2');
    });

    it('should clear chunks for the specified gameId', async () => {
      const { service } = await setup();

      service.stream('chunk1', 'game123');
      service.stream('chunk2', 'game123');

      const result1 = service.endStream('game123');
      expect(result1).toBe('chunk1chunk2');

      const result2 = service.endStream('game123');
      expect(result2).toBe('');
    });

    it('should not affect other games when ending stream', async () => {
      const { service, mockSocket1, mockSocket2 } = await setup();

      service.stream('chunk1', 'game123');
      service.stream('chunk3', 'game456');
      service.stream('chunk2', 'game123');
      service.stream('chunk4', 'game456');

      const result1 = service.endStream('game123');
      const result2 = service.endStream('game456');

      expect(mockSocket1.emit).toHaveBeenCalledWith('endOutput', 2);
      expect(mockSocket2.emit).toHaveBeenCalledWith('endOutput', 2);

      expect(result1).toBe('chunk1chunk2');
      expect(result2).toBe('chunk3chunk4');
    });
  });
});
