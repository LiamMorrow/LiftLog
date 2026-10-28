import { HubConnection, HubConnectionState } from '@microsoft/signalr';
import { AesEncryptedAndRsaSignedData } from '@/models/encryption-models';
import { LiveFrameResponse, WatchLiveResponse } from '@/models/feed-api-models';
import { HubConnectionFactory } from '@/services/hub-connection-factory';
import { base64ToUint8Array, uint8ArrayToBase64 } from '@/utils/base64';
import { selectBackendForFeature } from '@/store/backends';
import { selectFeedIdentityRemote } from '@/store/feed';
import type { RootState } from '@/store/store';

export type FeedHubLease = 'viewer' | 'trainer';
type AnyLease = FeedHubLease | 'transient';

export interface FeedHubListener {
  connected(): void;
  liveFrame(frame: LiveFrameResponse): void;
  liveEnded(userId: string, eventId: string): void;
  inboxNudge(): void;
}

type WireLiveFrame = Omit<LiveFrameResponse, 'encryptedEventPayload' | 'encryptedEventIV'> & {
  encryptedEventPayload: string;
  encryptedEventIV: string;
};

/** Switching tabs or finishing a workout briefly drops every lease, which should not cost a reconnect. */
export const FEED_HUB_STOP_GRACE_MS = 5_000;
const MAX_RECONNECT_DELAY_MS = 30_000;

/**
 * The realtime feed connection, open only while something holds a lease on it: the feed on screen, or a workout
 * shared live. Live workouts and inbox nudges arrive through the listener.
 */
export class FeedHubService {
  private readonly leases = new Map<AnyLease, number>();
  private connection: HubConnection | undefined;
  private connectionKey: string | undefined;
  private ready: Promise<boolean> = Promise.resolve(false);
  private stopTimer: ReturnType<typeof setTimeout> | undefined;
  private listener: FeedHubListener | undefined;

  constructor(
    private readonly hubConnectionFactory: HubConnectionFactory,
    private readonly getState: () => RootState,
  ) {}

  setListener(listener: FeedHubListener) {
    this.listener = listener;
  }

  hasLease(kind: FeedHubLease): boolean {
    return (this.leases.get(kind) ?? 0) > 0;
  }

  acquire(kind: FeedHubLease) {
    this.acquireAny(kind);
  }

  release(kind: FeedHubLease) {
    this.releaseAny(kind);
  }

  /** Reconnects when the feed backend or identity changes, and disconnects once nothing holds a lease. */
  sync() {
    const target = this.target();
    if (!target) {
      this.stopNow();
      return;
    }
    if (!this.anyLease()) {
      this.scheduleStop();
      return;
    }
    clearTimeout(this.stopTimer);
    this.stopTimer = undefined;
    if (this.connection && this.connectionKey === target.key) {
      return;
    }
    this.stopNow();
    this.start(target.backend, target.key);
  }

  async watch(followSecrets: string[]): Promise<WatchLiveResponse | undefined> {
    const connection = await this.readyConnection();
    if (!connection) {
      return undefined;
    }
    try {
      const response = await connection.invoke<{ frames: WireLiveFrame[]; invalidFollowSecrets: string[] }>(
        'Watch',
        followSecrets,
      );
      return { frames: response.frames.map(fromWireFrame), invalidFollowSecrets: response.invalidFollowSecrets };
    } catch (error) {
      console.warn('Could not watch live workouts', error);
      return undefined;
    }
  }

  async publishLive(eventId: string, payload: AesEncryptedAndRsaSignedData): Promise<boolean> {
    const connection = await this.readyConnection();
    if (!connection) {
      return false;
    }
    try {
      await connection.invoke(
        'PublishLive',
        eventId,
        uint8ArrayToBase64(payload.encryptedPayload),
        uint8ArrayToBase64(payload.iv.value),
      );
      return true;
    } catch (error) {
      console.warn('Could not publish the live workout', error);
      return false;
    }
  }

  /** Opens a connection of its own if it has to, as a workout can end after its screen has gone. */
  async endLive(eventId: string): Promise<boolean> {
    this.acquireAny('transient');
    try {
      const connection = await this.readyConnection();
      if (!connection) {
        return false;
      }
      await connection.invoke('EndLive', eventId);
      return true;
    } catch (error) {
      console.warn('Could not end the live workout', error);
      return false;
    } finally {
      this.releaseAny('transient');
    }
  }

  private acquireAny(kind: AnyLease) {
    this.leases.set(kind, (this.leases.get(kind) ?? 0) + 1);
    this.sync();
  }

  private releaseAny(kind: AnyLease) {
    this.leases.set(kind, Math.max(0, (this.leases.get(kind) ?? 0) - 1));
    this.sync();
  }

  private anyLease() {
    return [...this.leases.values()].some((count) => count > 0);
  }

  private target() {
    const state = this.getState();
    const backend = selectBackendForFeature(state, 'feed');
    const identity = selectFeedIdentityRemote(state).unwrapOr(undefined);
    if (!backend || !identity) {
      return undefined;
    }
    return { backend, key: JSON.stringify([backend.url, backend.headers, identity.id]) };
  }

  private start(backend: NonNullable<ReturnType<typeof selectBackendForFeature>>, key: string) {
    const connection = this.hubConnectionFactory.create(backend, '/feed-hub', {
      reconnectPolicy: {
        nextRetryDelayInMilliseconds: ({ previousRetryCount }) =>
          this.anyLease() ? Math.min(MAX_RECONNECT_DELAY_MS, 1000 * 2 ** previousRetryCount) : null,
      },
    });
    connection.on('LiveFrame', (frame: WireLiveFrame) => this.listener?.liveFrame(fromWireFrame(frame)));
    connection.on('LiveEnded', (userId: string, eventId: string) => this.listener?.liveEnded(userId, eventId));
    connection.on('InboxNudge', () => this.listener?.inboxNudge());
    let settleReconnect: ((ready: Promise<boolean> | boolean) => void) | undefined;
    connection.onreconnecting(() => {
      if (this.connection === connection) {
        this.ready = new Promise((resolve) => (settleReconnect = resolve));
      }
    });
    connection.onreconnected(() => settleReconnect?.(this.authenticate(connection)));
    connection.onclose(() => {
      settleReconnect?.(false);
      if (this.connection === connection) {
        this.connection = undefined;
        this.connectionKey = undefined;
        this.ready = Promise.resolve(false);
      }
    });

    this.connection = connection;
    this.connectionKey = key;
    this.ready = connection.start().then(
      () => this.authenticate(connection),
      (error: unknown) => {
        console.warn('Could not connect to the feed hub', error);
        if (this.connection === connection) {
          this.stopNow();
        }
        return false;
      },
    );
  }

  private async authenticate(connection: HubConnection): Promise<boolean> {
    const identity = selectFeedIdentityRemote(this.getState()).unwrapOr(undefined);
    if (!identity) {
      return false;
    }
    try {
      await connection.invoke('Authenticate', identity.id, identity.password);
    } catch (error) {
      console.warn('The feed hub did not accept our identity', error);
      return false;
    }
    if (this.connection === connection) {
      this.listener?.connected();
    }
    return true;
  }

  private async readyConnection(): Promise<HubConnection | undefined> {
    const connection = this.connection;
    if (!connection || !(await this.ready)) {
      return undefined;
    }
    return this.connection === connection && connection.state === HubConnectionState.Connected ? connection : undefined;
  }

  private scheduleStop() {
    if (this.stopTimer || !this.connection) {
      return;
    }
    this.stopTimer = setTimeout(() => {
      this.stopTimer = undefined;
      if (!this.anyLease()) {
        this.stopNow();
      }
    }, FEED_HUB_STOP_GRACE_MS);
  }

  private stopNow() {
    clearTimeout(this.stopTimer);
    this.stopTimer = undefined;
    const connection = this.connection;
    this.connection = undefined;
    this.connectionKey = undefined;
    this.ready = Promise.resolve(false);
    void connection?.stop();
  }
}

function fromWireFrame(frame: WireLiveFrame): LiveFrameResponse {
  return {
    userId: frame.userId,
    eventId: frame.eventId,
    timestamp: frame.timestamp,
    encryptedEventPayload: base64ToUint8Array(frame.encryptedEventPayload),
    encryptedEventIV: base64ToUint8Array(frame.encryptedEventIV),
  };
}
