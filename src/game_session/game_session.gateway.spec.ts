import { Test, TestingModule } from '@nestjs/testing';
import { GameSessionGateway } from './game_session.gateway';
import { TEST_ONLY } from './game_session.gateway';
import { AppService } from 'src/app.service';

describe('GameSessionGateway', () => {
  let gateway: GameSessionGateway;
  const mockAppService = { startGame: jest.fn() };
  const { stringifyWithTruncation } = TEST_ONLY;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameSessionGateway,
        { provide: AppService, useValue: mockAppService },
      ],
    }).compile();

    gateway = module.get<GameSessionGateway>(GameSessionGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('stringifyWithTruncation helper', () => {
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
});
