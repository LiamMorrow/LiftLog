import React, { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { Duration, OffsetDateTime } from '@js-joda/core';
import { impactAsync } from 'expo-haptics';
import RestTimer from './rest-timer';

vi.mock('expo-haptics', () => ({
  impactAsync: vi.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Heavy: 'heavy' },
}));
vi.mock('@tolgee/react', () => ({ useTranslate: () => ({ t: (key: string) => key }) }));
vi.mock('@/components/presentation/workout/timer-pane', () => ({
  formatTimeSpan: (ms: number) => String(Math.floor(ms / 1000)),
  TimerPane: ({ time, status, controls }: { time: string; status: string; controls: React.ReactNode }) => (
    <div>
      <span data-testid="time">{time}</span>
      <span data-testid="status">{status}</span>
      {controls}
    </div>
  ),
}));
vi.mock('@/components/presentation/workout/rest-timer-controls', () => ({ RestTimerControls: () => null }));

const start = OffsetDateTime.parse('2025-04-05T12:00:00Z');
const rest = { minRest: Duration.ofSeconds(5), maxRest: Duration.ofSeconds(5), failureRest: Duration.ofMinutes(5) };
function props(overrides: Partial<ComponentProps<typeof RestTimer>> = {}): ComponentProps<typeof RestTimer> {
  return {
    rest,
    startTime: start,
    pausedAt: undefined,
    failed: false,
    onRestart: vi.fn(),
    onDismiss: vi.fn(),
    onTogglePause: vi.fn(),
    ...overrides,
  };
}
function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}
function expectPhase(phase: string) {
  expect(screen.getByText(`rest_timer.status.${phase}`)).toBeDefined();
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(start.toString()));
  vi.mocked(impactAsync).mockClear();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('rest target corrections', () => {
  it('returns from overtime to counting down and alerts again at the extended deadline', () => {
    const view = render(<RestTimer {...props()} />);
    advance(20_000);
    expectPhase('over');
    expect(screen.getByText('+15')).toBeDefined();
    const originalAlerts = vi.mocked(impactAsync).mock.calls.length;
    expect(originalAlerts).toBeGreaterThan(0);

    view.rerender(<RestTimer {...props({ failed: true })} />);
    advance(200);
    expectPhase('resting');
    expect(screen.getByText('279')).toBeDefined();
    expect(impactAsync).toHaveBeenCalledTimes(originalAlerts);
    advance(279_800);
    expectPhase('over');
    expect(vi.mocked(impactAsync).mock.calls.length).toBeGreaterThan(originalAlerts);
    const finalAlerts = vi.mocked(impactAsync).mock.calls.length;
    advance(2_000);
    expect(impactAsync).toHaveBeenCalledTimes(finalAlerts);
  });

  it('can repeatedly shorten and extend the target without changing the start', () => {
    const view = render(<RestTimer {...props({ failed: true })} />);
    advance(20_000);
    for (let i = 0; i < 3; i++) {
      view.rerender(<RestTimer {...props()} />);
      advance(200);
      expectPhase('over');
      view.rerender(<RestTimer {...props({ failed: true })} />);
      advance(200);
      expectPhase('resting');
    }
    expect(screen.getByText('278')).toBeDefined();
  });

  it('stays over when the extended deadline has also elapsed', () => {
    const view = render(<RestTimer {...props()} />);
    advance(360_000);
    const alerts = vi.mocked(impactAsync).mock.calls.length;
    view.rerender(<RestTimer {...props({ failed: true })} />);
    advance(200);
    expectPhase('over');
    expect(screen.getByText('+60')).toBeDefined();
    expect(impactAsync).toHaveBeenCalledTimes(alerts);
  });

  it('keeps a corrected paused timer frozen and silent, then resumes with the new target', () => {
    const view = render(<RestTimer {...props()} />);
    advance(2_000);
    view.rerender(<RestTimer {...props({ pausedAt: start.plusSeconds(2), failed: true })} />);
    advance(20_000);
    expectPhase('paused');
    expect(screen.getByText('298')).toBeDefined();
    expect(impactAsync).not.toHaveBeenCalled();
    view.rerender(<RestTimer {...props({ startTime: start.plusSeconds(20), failed: true })} />);
    advance(1_000);
    expectPhase('resting');
    expect(screen.getByText('297')).toBeDefined();
  });

  it('does not replay a reached milestone on resume or an unrelated rerender', () => {
    const window = { ...rest, maxRest: Duration.ofSeconds(10) };
    const view = render(<RestTimer {...props({ rest: window })} />);
    advance(6_000);
    expectPhase('ready');
    expect(impactAsync).toHaveBeenCalledTimes(1);
    view.rerender(<RestTimer {...props({ rest: window, pausedAt: start.plusSeconds(6) })} />);
    advance(10_000);
    view.rerender(<RestTimer {...props({ rest: { ...window }, startTime: start.plusSeconds(10) })} />);
    advance(200);
    expect(impactAsync).toHaveBeenCalledTimes(1);
    advance(3_800);
    expectPhase('over');
    expect(impactAsync).toHaveBeenCalledTimes(2);
  });
});
