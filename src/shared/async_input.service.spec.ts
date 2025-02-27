import { Test, TestingModule } from '@nestjs/testing';
import { AsyncInputService } from './async_input.service';
import { InputKey } from 'src/lang_graph/entities/input_events';

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
    service.sendInput(
      { text: 'test-input', gameId: 'game123' },
      InputKey.ACTION,
    );

    const inputQueue = (service as any).inputQueueMap.get(
      JSON.stringify({ key: InputKey.ACTION, gameId: 'game123' }),
    );
    expect(inputQueue).toEqual(['test-input']);
  });

  it('should resolve pending request when input is sent', async () => {
    const { service } = await setup();
    const inputPromise = service.requestInput(InputKey.ACTION, 'game123');

    service.sendInput(
      { text: 'test-input', gameId: 'game123' },
      InputKey.ACTION,
    );

    expect(await inputPromise).toBe('test-input');
  });

  it('should return input immediately if available', async () => {
    const { service } = await setup();
    service.sendInput(
      { text: 'test-input', gameId: 'game123' },
      InputKey.ACTION,
    );

    const inputPromise = service.requestInput(InputKey.ACTION, 'game123');

    expect(await inputPromise).toBe('test-input');
  });

  it('should queue multiple inputs and resolve in order', async () => {
    const { service } = await setup();
    service.sendInput(
      { text: 'first-input', gameId: 'game123' },
      InputKey.ACTION,
    );
    service.sendInput(
      { text: 'second-input', gameId: 'game123' },
      InputKey.ACTION,
    );

    const firstResult = await service.requestInput(InputKey.ACTION, 'game123');
    const secondResult = await service.requestInput(InputKey.ACTION, 'game123');

    expect(firstResult).toBe('first-input');
    expect(secondResult).toBe('second-input');
  });

  it('directs input to the correct key for immediate input', async () => {
    const { service } = await setup();

    service.sendInput(
      { text: 'action-input', gameId: 'game123' },
      InputKey.ACTION,
    );
    service.sendInput(
      { text: 'unknown-input', gameId: 'game123' },
      InputKey.UNKNOWN,
    );

    const actionResult = await service.requestInput(InputKey.ACTION, 'game123');
    const unknownResult = await service.requestInput(
      InputKey.UNKNOWN,
      'game123',
    );

    expect(actionResult).toBe('action-input');
    expect(unknownResult).toBe('unknown-input');
  });

  it('directs input to the correct key for pending requests', async () => {
    const { service } = await setup();

    const actionPromise = service.requestInput(InputKey.ACTION, 'game123');
    const unknownPromise = service.requestInput(InputKey.UNKNOWN, 'game123');

    service.sendInput(
      { text: 'action-input', gameId: 'game123' },
      InputKey.ACTION,
    );
    service.sendInput(
      { text: 'unknown-input', gameId: 'game123' },
      InputKey.UNKNOWN,
    );

    expect(await actionPromise).toBe('action-input');
    expect(await unknownPromise).toBe('unknown-input');
  });

  it('should handle multiple games independently for pending requests', async () => {
    const { service } = await setup();

    const actionPromise1 = service.requestInput(InputKey.ACTION, 'game123');
    const actionPromise2 = service.requestInput(InputKey.ACTION, 'game456');

    service.sendInput(
      { text: 'action-input1', gameId: 'game123' },
      InputKey.ACTION,
    );
    service.sendInput(
      { text: 'action-input2', gameId: 'game456' },
      InputKey.ACTION,
    );

    expect(await actionPromise1).toBe('action-input1');
    expect(await actionPromise2).toBe('action-input2');
  });

  it('should handle multiple games independently for immediate input', async () => {
    const { service } = await setup();

    service.sendInput(
      { text: 'action-input1', gameId: 'game123' },
      InputKey.ACTION,
    );
    service.sendInput(
      { text: 'action-input2', gameId: 'game456' },
      InputKey.ACTION,
    );

    const actionResult1 = await service.requestInput(
      InputKey.ACTION,
      'game123',
    );
    const actionResult2 = await service.requestInput(
      InputKey.ACTION,
      'game456',
    );

    expect(actionResult1).toBe('action-input1');
    expect(actionResult2).toBe('action-input2');
  });
});
