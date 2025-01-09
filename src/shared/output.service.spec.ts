import { Test, TestingModule } from '@nestjs/testing';
import { OutputService } from './output.service';
import { type Socket } from 'socket.io';

describe('OutputService', () => {
  async function setup() {
    const mockSocket = {
      emit: jest.fn(),
    } as unknown as Socket;

    const module: TestingModule = await Test.createTestingModule({
      providers: [OutputService],
    }).compile();

    const service = module.get<OutputService>(OutputService);
    jest.clearAllMocks();
    return { service, mockSocket };
  }

  it('should be defined', async () => {
    const { service } = await setup();
    expect(service).toBeDefined();
  });

  describe('stream', () => {
    it('should emit output', async () => {
      const { service, mockSocket } = await setup();
      service.setSocket(mockSocket);

      service.stream('chunk1');
      service.stream('chunk2');

      expect(mockSocket.emit).toHaveBeenCalledWith('output', {
        content: 'chunk1',
        order: 0,
      });
      expect(mockSocket.emit).toHaveBeenCalledWith('output', {
        content: 'chunk2',
        order: 1,
      });
    });

    it('should store chunks', async () => {
      const { service, mockSocket } = await setup();
      service.setSocket(mockSocket);

      service.stream('chunk1');
      service.stream('chunk2');
      expect(service['chunks']).toEqual(['chunk1', 'chunk2']);
    });
  });

  describe('endStream', () => {
    it('should emit endOutput', async () => {
      const { service, mockSocket } = await setup();
      service.setSocket(mockSocket);
      service.stream('chunk1');
      service.stream('chunk2');

      service.endStream();
      expect(mockSocket.emit).toHaveBeenCalledWith('endOutput', 2);
    });

    it('should return joined chunks', async () => {
      const { service, mockSocket } = await setup();
      service.setSocket(mockSocket);
      service.stream('chunk1');
      service.stream('chunk2');

      const result = service.endStream();
      expect(result).toBe('chunk1chunk2');
    });

    it('should clear chunks', async () => {
      const { service, mockSocket } = await setup();
      service.setSocket(mockSocket);
      service.stream('chunk1');
      service.stream('chunk2');

      const result1 = service.endStream();
      expect(result1).toBe('chunk1chunk2');

      const result2 = service.endStream();
      expect(result2).toBe('');
    });
  });
});
