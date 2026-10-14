import { Backend } from '@/models/backend';
import { AiChatServiceV2 } from '@/services/ai-chat-service-v2';
import { HubConnectionFactory } from '@/services/hub-connection-factory';
import { RootState } from '@/store';
import { HubConnection, HubConnectionState } from '@microsoft/signalr';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-native-purchases', () => ({ default: { syncPurchases: () => Promise.resolve() } }));

const backendA: Backend = { id: 'a', name: 'A', url: 'https://a.example.com', kind: 'liftlog', headers: [] };
const backendB: Backend = { id: 'b', name: 'B', url: 'https://b.example.com', kind: 'liftlog', headers: [] };

function stateWith(assignedId: string, backends: Backend[] = [backendA, backendB]): RootState {
  return {
    backends: { backends, assignments: { aiPlanner: assignedId }, isHydrated: true },
    settings: { proToken: undefined, preferredWeightUnit: 'kilograms' },
  } as unknown as RootState;
}

class FakeConnection {
  state: HubConnectionState = HubConnectionState.Disconnected;
  start = vi.fn(() => {
    this.state = HubConnectionState.Connected;
    return Promise.resolve();
  });
  stop = vi.fn(() => {
    this.state = HubConnectionState.Disconnected;
    return Promise.resolve();
  });
  send = vi.fn(() => Promise.resolve());
  invoke = vi.fn(() => Promise.resolve());
  on = vi.fn();
  off = vi.fn();
  onclose = vi.fn();
}

let connections: FakeConnection[];
let state: RootState;
let service: AiChatServiceV2;
let create: ReturnType<typeof vi.fn>;

beforeEach(() => {
  connections = [];
  state = stateWith('a');
  create = vi.fn(() => {
    const connection = new FakeConnection();
    connections.push(connection);
    return connection as unknown as HubConnection;
  });
  service = new AiChatServiceV2({ create } as unknown as HubConnectionFactory, () => state);
});

const connection = (index: number) => connections[index]!;

async function sendMessage(message: string) {
  for await (const _ of service.sendMessage(message)) {
    // drain
  }
}

describe('AiChatServiceV2', () => {
  it('keeps one connection while the planner stays on the same backend', async () => {
    await sendMessage('hello');
    await sendMessage('again');

    expect(create).toHaveBeenCalledTimes(1);
  });

  it('opens a new connection on the new server when the planner is repointed', async () => {
    await sendMessage('hello');
    state = stateWith('b');

    await sendMessage('on the new server');

    expect(create).toHaveBeenCalledTimes(2);
    expect(create.mock.calls[1]![0]).toMatchObject({ url: backendB.url });
    expect(connection(0).stop).toHaveBeenCalled();
  });

  // Editing the assigned backend points it somewhere else just as surely as picking another one.
  it('opens a new connection when the assigned backend is edited', async () => {
    await sendMessage('hello');
    state = stateWith('a', [{ ...backendA, url: 'https://moved.example.com' }, backendB]);

    await sendMessage('after the edit');

    expect(create).toHaveBeenCalledTimes(2);
    expect(create.mock.calls[1]![0]).toMatchObject({ url: 'https://moved.example.com' });
  });

  it('restarts on the server it is already connected to', async () => {
    await sendMessage('hello');

    await service.restartChat();

    expect(connection(0).send).toHaveBeenCalledWith('RestartChat');
    expect(connection(0).stop).not.toHaveBeenCalled();
  });

  // The new server has never seen the chat, so there is nothing there to tell it to restart.
  it('drops the connection instead of restarting when the planner has been repointed', async () => {
    await sendMessage('hello');
    state = stateWith('b');

    await service.restartChat();

    expect(connection(0).stop).toHaveBeenCalled();
    expect(connection(0).send).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledTimes(1);
  });
});
