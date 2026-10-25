import { useNow } from '@/hooks/useNow';
import { LiveSessionUserEvent } from '@/models/feed-models';
import { Duration } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';

export const LIVE_CLOCK_INTERVAL_MS = 30 * 1000;

export function useLiveLabel(item: LiveSessionUserEvent): string {
  const { t } = useTranslate();
  const now = useNow(LIVE_CLOCK_INTERVAL_MS);
  const startedAt = item.session.startedAt?.toInstant();
  if (!startedAt) {
    return t('feed.live.label');
  }
  const minutes = Math.max(1, Duration.between(startedAt, now).toMinutes());
  return t('feed.live.minutes', { minutes: minutes.toString() });
}
