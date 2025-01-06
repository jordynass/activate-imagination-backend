import { Test, TestingModule } from '@nestjs/testing';
import { OutputService } from './output.service';

describe('OutputService', () => {
  let service: OutputService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OutputService],
    }).compile();

    service = module.get<OutputService>(OutputService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
