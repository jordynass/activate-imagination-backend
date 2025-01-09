import { Test, TestingModule } from '@nestjs/testing';
import { AsyncInputService } from './async_input.service';

describe('InputService', () => {
  async function setup() {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AsyncInputService],
    }).compile();

    const service = module.get<AsyncInputService>(AsyncInputService);
    jest.clearAllMocks();
    return { service };
  }

  it('should be defined', async () => {
    const { service } = await setup();
    expect(service).toBeDefined();
  });
});
