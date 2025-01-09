import { Test, TestingModule } from '@nestjs/testing';
import { AsyncInputService, InputKey } from './async_input.service';

describe('AsyncInputService', () => {
  async function setup() {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AsyncInputService],
    }).compile();

    const service = module.get<AsyncInputService>(AsyncInputService);
    jest.clearAllMocks();
    return { service };
  }

  it('should store input when no request is pending', async () => {
    const { service } = await setup();
    service.sendInput('test-input', InputKey.ACTION);

    const inputQueue = (service as any).inputQueueByKey.get(InputKey.ACTION);
    expect(inputQueue).toEqual(['test-input']);
  });

  it('should resolve pending request when input is sent', async () => {
    const { service } = await setup();
    const inputPromise = service.requestInput(InputKey.ACTION);

    service.sendInput('test-input', InputKey.ACTION);

    expect(await inputPromise).toBe('test-input');
  });

  it('should return input immediately if available', async () => {
    const { service } = await setup();
    service.sendInput('test-input', InputKey.ACTION);

    const inputPromise = service.requestInput(InputKey.ACTION);

    expect(await inputPromise).toBe('test-input');
  });

  it('should queue multiple inputs and resolve in order', async () => {
    const { service } = await setup();
    service.sendInput('first-input', InputKey.ACTION);
    service.sendInput('second-input', InputKey.ACTION);

    const firstResult = await service.requestInput(InputKey.ACTION);
    const secondResult = await service.requestInput(InputKey.ACTION);

    expect(firstResult).toBe('first-input');
    expect(secondResult).toBe('second-input');
  });

  it('directs input to the correct key for immediate input', async () => {
    const { service } = await setup();

    service.sendInput('action-input', InputKey.ACTION);
    service.sendInput('unknown-input', InputKey.UNKNOWN);

    const actionResult = await service.requestInput(InputKey.ACTION);
    const unknownResult = await service.requestInput(InputKey.UNKNOWN);

    expect(actionResult).toBe('action-input');
    expect(unknownResult).toBe('unknown-input');
  });

  it('directs input to the correct key for pending requests', async () => {
    const { service } = await setup();

    const actionPromise = service.requestInput(InputKey.ACTION);
    const unknownPromise = service.requestInput(InputKey.UNKNOWN);

    service.sendInput('action-input', InputKey.ACTION);
    service.sendInput('unknown-input', InputKey.UNKNOWN);

    expect(await actionPromise).toBe('action-input');
    expect(await unknownPromise).toBe('unknown-input');
  });
});
