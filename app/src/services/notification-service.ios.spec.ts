import { OffsetDateTime } from '@js-joda/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const calls: string[] = [];
const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

vi.mock('expo-notifications', () => ({
  setNotificationHandler: vi.fn(),
  SchedulableTriggerInputTypes: { DATE: 'date' },
  cancelScheduledNotificationAsync: vi.fn(async () => {
    await tick();
    calls.push('cancel');
  }),
  dismissNotificationAsync: vi.fn(async () => {
    calls.push('dismiss');
  }),
  requestPermissionsAsync: vi.fn(async () => {
    await tick();
  }),
  scheduleNotificationAsync: vi.fn(async () => {
    calls.push('schedule');
  }),
}));

const { NotificationService } = await import('./notification-service.ios');

describe('NotificationService (iOS)', () => {
  beforeEach(() => {
    calls.length = 0;
  });

  it('runs overlapping calls in order so a late cancel cannot drop the scheduled notification', async () => {
    const service = new NotificationService(vi.fn(), vi.fn());
    const time = OffsetDateTime.now().plusMinutes(2);

    await Promise.all([
      service.scheduleNextSetNotification(time),
      service.clearSetTimerNotification(),
      service.scheduleNextSetNotification(time),
    ]);

    expect(calls).toEqual(['cancel', 'dismiss', 'schedule', 'cancel', 'dismiss', 'cancel', 'dismiss', 'schedule']);
  });

  it('keeps working after a call fails', async () => {
    const notifications = await import('expo-notifications');
    vi.mocked(notifications.scheduleNotificationAsync).mockRejectedValueOnce(new Error('boom'));
    const service = new NotificationService(vi.fn(), vi.fn());
    const time = OffsetDateTime.now().plusMinutes(2);

    await expect(service.scheduleNextSetNotification(time)).rejects.toThrow('boom');
    await service.scheduleNextSetNotification(time);

    expect(calls.at(-1)).toBe('schedule');
  });
});
