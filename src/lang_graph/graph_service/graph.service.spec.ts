import { Test, TestingModule } from '@nestjs/testing';
import { GraphService } from './graph.service';
import { OutputService } from 'src/output_service/output.service';

const mockOutputService = { setSocket: jest.fn() };

describe('GraphService', () => {
  let service: GraphService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GraphService,
        { provide: OutputService, useValue: mockOutputService },
      ],
    }).compile();

    service = module.get<GraphService>(GraphService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
