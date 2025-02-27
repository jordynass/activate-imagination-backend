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
    service.sendInput({
      key: InputKey.ACTION,
      gameId: 'game123',
      payload: 'test-input',
    });

    const inputQueue = (service as any).inputQueueMap.get(
      JSON.stringify({ key: InputKey.ACTION, gameId: 'game123' }),
    );
    expect(inputQueue).toEqual(['test-input']);
  });

  it('should resolve pending request when input is sent', async () => {
    const { service } = await setup();
    const inputPromise = service.requestInput(InputKey.ACTION, 'game123');
    service.sendInput({
      key: InputKey.ACTION,
      gameId: 'game123',
      payload: 'test-input',
    });

    expect(await inputPromise).toBe('test-input');
  });

  it('should return input immediately if available', async () => {
    const { service } = await setup();
    service.sendInput({
      key: InputKey.ACTION,
      gameId: 'game123',
      payload: 'test-input',
    });

    const inputPromise = service.requestInput(InputKey.ACTION, 'game123');

    expect(await inputPromise).toBe('test-input');
  });

  it('should queue multiple inputs and resolve in order', async () => {
    const { service } = await setup();
    service.sendInput({
      key: InputKey.ACTION,
      gameId: 'game123',
      payload: 'first-input',
    });
    service.sendInput({
      key: InputKey.ACTION,
      gameId: 'game123',
      payload: 'second-input',
    });

    const firstResult = await service.requestInput(InputKey.ACTION, 'game123');
    const secondResult = await service.requestInput(InputKey.ACTION, 'game123');

    expect(firstResult).toBe('first-input');
    expect(secondResult).toBe('second-input');
  });

  it('directs input to the correct key for immediate input', async () => {
    const { service } = await setup();

    service.sendInput({
      key: InputKey.ACTION,
      gameId: 'game123',
      payload: 'action-input',
    });
    service.sendInput({
      key: InputKey.NEW_SCENE,
      gameId: 'game123',
      payload: 'new-scene-input',
    });

    const actionResult = await service.requestInput(InputKey.ACTION, 'game123');
    const newSceneResult = await service.requestInput(
      InputKey.NEW_SCENE,
      'game123',
    );

    expect(actionResult).toBe('action-input');
    expect(newSceneResult).toBe('new-scene-input');
  });

  it('directs input to the correct key for pending requests', async () => {
    const { service } = await setup();

    const actionPromise = service.requestInput(InputKey.ACTION, 'game123');
    const newScenePromise = service.requestInput(InputKey.NEW_SCENE, 'game123');

    service.sendInput({
      key: InputKey.ACTION,
      gameId: 'game123',
      payload: 'action-input',
    });
    service.sendInput({
      key: InputKey.NEW_SCENE,
      gameId: 'game123',
      payload: 'new-scene-input',
    });

    expect(await actionPromise).toBe('action-input');
    expect(await newScenePromise).toBe('new-scene-input');
  });

  it('should handle multiple games independently for pending requests', async () => {
    const { service } = await setup();

    const actionPromise1 = service.requestInput(InputKey.ACTION, 'game123');
    const actionPromise2 = service.requestInput(InputKey.ACTION, 'game456');

    service.sendInput({
      key: InputKey.ACTION,
      gameId: 'game123',
      payload: 'action-input123',
    });
    service.sendInput({
      key: InputKey.ACTION,
      gameId: 'game456',
      payload: 'action-input456',
    });

    expect(await actionPromise1).toBe('action-input123');
    expect(await actionPromise2).toBe('action-input456');
  });

  it('should handle multiple games independently for immediate input', async () => {
    const { service } = await setup();

    service.sendInput({
      key: InputKey.ACTION,
      gameId: 'game123',
      payload: 'action-input123',
    });
    service.sendInput({
      key: InputKey.ACTION,
      gameId: 'game456',
      payload: 'action-input456',
    });

    const actionResult1 = await service.requestInput(
      InputKey.ACTION,
      'game123',
    );
    const actionResult2 = await service.requestInput(
      InputKey.ACTION,
      'game456',
    );

    expect(actionResult1).toBe('action-input123');
    expect(actionResult2).toBe('action-input456');
  });
});
