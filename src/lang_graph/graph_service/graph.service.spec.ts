import { Test, TestingModule } from '@nestjs/testing';
import { GraphService } from './graph.service';
import { OutputService } from 'src/output_service/output.service';

describe('GraphService', () => {
  async function setup() {
    const mockOutputService = { setSocket: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GraphService,
        { provide: OutputService, useValue: mockOutputService },
      ],
    }).compile();

    const service = module.get<GraphService>(GraphService);
    jest.clearAllMocks();
    return { service, mockOutputService };
  }

  it('should be defined', async () => {
    const { service } = await setup();
    expect(service).toBeDefined();
  });
});
