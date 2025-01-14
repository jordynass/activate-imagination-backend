import { Test, TestingModule } from '@nestjs/testing';
import { ClientService } from './client.service';
import { Socket } from 'socket.io';

describe('ClientService', () => {
  let service: ClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientService],
    }).compile();

    service = module.get<ClientService>(ClientService);
  });

  it('should add a new client', () => {
    const mockSocket = {} as Socket;
    const gameId = 'game123';

    service.setClient(gameId, mockSocket);

    expect(service.getClient(gameId)).toBe(mockSocket);
  });

  it('should return true if the game is new', () => {
    const mockSocket = {} as Socket;
    const gameId = 'game123';

    const isNewGame = service.setClient(gameId, mockSocket);

    expect(isNewGame).toBe(true);
  });

  it('should update the client for an existing game', () => {
    const mockSocket1 = {} as Socket;
    const mockSocket2 = {} as Socket;
    const gameId = 'game123';

    service.setClient(gameId, mockSocket1);
    service.setClient(gameId, mockSocket2);

    expect(service.getClient(gameId)).toBe(mockSocket2);
  });

  it('should return false if the game is already in progress', () => {
    const mockSocket1 = {} as Socket;
    const mockSocket2 = {} as Socket;
    const gameId = 'game123';

    service.setClient(gameId, mockSocket1);
    const isNewGame = service.setClient(gameId, mockSocket2);

    expect(isNewGame).toBe(false);
  });

  it('should return the correct client for a given game ID', () => {
    const mockSocket1 = {} as Socket;
    const mockSocket2 = {} as Socket;
    const gameId1 = 'game123';
    const gameId2 = 'game456';

    service.setClient(gameId1, mockSocket1);
    service.setClient(gameId2, mockSocket2);

    const client1 = service.getClient(gameId1);
    const client2 = service.getClient(gameId2);

    expect(client1).toBe(mockSocket1);
    expect(client2).toBe(mockSocket2);
  });

  it('should return undefined for a non-existing game ID', () => {
    const gameId = 'non-existing-game';

    const client = service.getClient(gameId);

    expect(client).toBeUndefined();
  });
});
