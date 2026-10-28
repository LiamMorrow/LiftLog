import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HubConnectionState } from '@microsoft/signalr';
import { FEED_HUB_STOP_GRACE_MS, FeedHubListener, FeedHubService } from '@/services/feed-hub-service';
import { HubConnectionFactory } from '@/services/hub-connection-factory';
import { RemoteData } from '@/models/remote';
import { FeedIdentity } from '@/models/feed-models';
import type { RootState } from '@/store/store';

vi.mock('@/store/backends', () => ({
  selectBackendForFeature: (state: { backend?: { url: string; headers: Record<string, string> } }) => state.backend,
}));

function fakeConnection({ startFails = false } = {}) {
  const handlers = new Map<string, (...args: unknown[]) => void>();
  const connection = {
    state: HubConnectionState.Disconnected as HubConnectionState,
    start: vi.fn(() => {
      if (startFails) {
        return Promise.reject(new Error('no hub here'));
      }
      connection.state = HubConnectionState.Connected;
      return Promise.resolve();
    }),
    stop: vi.fn(() => {
      connection.state = HubConnectionState.Disconnected;
      return Promise.resolve();
    }),
    invoke: vi.fn((method: string) =>
      Promise.resolve(method === 'Watch' ? { frames: [], invalidFollowSecrets: [] } : undefined),
    ),
    on: vi.fn((name: string, handler: (...args: unknown[]) => void) => handlers.set(name, handler)),
    onreconnecting: vi.fn(),
    onreconnected: vi.fn(),
    onclose: vi.fn(),
    emit: (name: string, ...args: unknown[]) => handlers.get(name)?.(...args),
  };
  return connection;
}

const identity = { id: 'me', password: 'pw' } as FeedIdentity;

function serviceTestBed({ startFails = false, withIdentity = true } = {}) {
  const connections: ReturnType<typeof fakeConnection>[] = [];
  const factory = {
    create: vi.fn(() => {
      const connection = fakeConnection({ startFails });
      connections.push(connection);
      return connection;
    }),
  };
  const state = {
    backend: { url: 'https://api.example.com', headers: {} },
    feed: { identity: withIdentity ? RemoteData.success(identity) : RemoteData.notAsked() },
  };
  const listener: FeedHubListener = {
    connected: vi.fn(),
    liveFrame: vi.fn(),
    liveEnded: vi.fn(),
    inboxNudge: vi.fn(),
  };
  const service = new FeedHubService(factory as unknown as HubConnectionFactory, () => state as unknown as RootState);
  service.setListener(listener);
  return { service, factory, connections, listener };
}

describe('FeedHubService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('connects on the first lease and authenticates before saying it is connected', async () => {
    const { service, factory, connections, listener } = serviceTestBed();

    service.acquire('viewer');
    await vi.advanceTimersByTimeAsync(0);

    expect(factory.create).toHaveBeenCalledTimes(1);
    expect(connections[0]!.invoke).toHaveBeenCalledWith('Authenticate', 'me', 'pw');
    expect(listener.connected).toHaveBeenCalledTimes(1);
  });

  it('shares one connection between leases', async () => {
    const { service, factory } = serviceTestBed();

    service.acquire('viewer');
    service.acquire('trainer');
    await vi.advanceTimersByTimeAsync(0);

    expect(factory.create).toHaveBeenCalledTimes(1);
  });

  it('disconnects once the last lease has been gone for the grace period', async () => {
    const { service, connections } = serviceTestBed();
    service.acquire('viewer');
    await vi.advanceTimersByTimeAsync(0);

    service.release('viewer');
    await vi.advanceTimersByTimeAsync(FEED_HUB_STOP_GRACE_MS - 1);
    expect(connections[0]!.stop).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(connections[0]!.stop).toHaveBeenCalled();
  });

  it('keeps the connection when a lease returns within the grace period', async () => {
    const { service, factory, connections } = serviceTestBed();
    service.acquire('viewer');
    await vi.advanceTimersByTimeAsync(0);

    service.release('viewer');
    service.acquire('trainer');
    await vi.advanceTimersByTimeAsync(FEED_HUB_STOP_GRACE_MS * 2);

    expect(connections[0]!.stop).not.toHaveBeenCalled();
    expect(factory.create).toHaveBeenCalledTimes(1);
  });

  it('does not connect without a feed identity', async () => {
    const { service, factory } = serviceTestBed({ withIdentity: false });

    service.acquire('viewer');
    await vi.advanceTimersByTimeAsync(0);

    expect(factory.create).not.toHaveBeenCalled();
  });

  it('gives up quietly on a backend without the hub', async () => {
    const { service, listener } = serviceTestBed({ startFails: true });
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    service.acquire('viewer');

    expect(await service.watch(['secret'])).toBeUndefined();
    expect(listener.connected).not.toHaveBeenCalled();
  });

  it('opens a connection of its own to end a live workout, and lets it go after', async () => {
    const { service, connections } = serviceTestBed();

    expect(await service.endLive('s1')).toBe(true);
    expect(connections[0]!.invoke).toHaveBeenCalledWith('EndLive', 's1');

    await vi.advanceTimersByTimeAsync(FEED_HUB_STOP_GRACE_MS);
    expect(connections[0]!.stop).toHaveBeenCalled();
  });

  it('decodes live frames for the listener', async () => {
    const { service, connections, listener } = serviceTestBed();
    service.acquire('viewer');
    await vi.advanceTimersByTimeAsync(0);

    connections[0]!.emit('LiveFrame', {
      userId: 'friend',
      eventId: 's1',
      timestamp: '2026-10-28T09:00:00Z',
      encryptedEventPayload: btoa('\x01\x02'),
      encryptedEventIV: btoa('\x03'),
    });

    expect(listener.liveFrame).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'friend',
        encryptedEventPayload: new Uint8Array([1, 2]),
        encryptedEventIV: new Uint8Array([3]),
      }),
    );
  });
});
