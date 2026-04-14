import { SessionPOJO } from '@/models/session-models';
import { TemporalComparer } from '@/models/comparers';
import { Session } from '@/models/session-models';
import Enumerable from 'linq';
import { RootState } from '@/store';
import { getSessionReferenceTime } from '@/store/stored-sessions';

export class ProgressRepository {
  constructor(private getState: () => RootState) {}

  private getSessionMap(): Record<string, SessionPOJO> {
    if (!this.getState().storedSessions.isHydrated) {
      throw new Error('Tried to get stored session state before hydration');
    }
    return this.getState().storedSessions.sessions;
  }

  getOrderedSessions(): Enumerable.IEnumerable<Session> {
    const sessions = this.getSessionMap();

    return Enumerable.from(sessions)
      .select((x) => Session.fromPOJO(x.value))
      .orderByDescending((x) => getSessionReferenceTime(x), TemporalComparer);
  }
}
