import { Test, TestingModule } from '@nestjs/testing';
import { OutputService } from './output.service';

describe('OutputService', () => {
  async function setup() {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OutputService],
    }).compile();

    const service = module.get<OutputService>(OutputService);
    jest.clearAllMocks();
    return { service };
  }

  it('should be defined', async () => {
    const { service } = await setup();
    expect(service).toBeDefined();
  });
});
