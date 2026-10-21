import { expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactNode } from 'react';
import type { Session } from '@/models/session-models';
import SessionSummaryTitle from './session-summary-title';

const { layout } = vi.hoisted(() => ({ layout: { value: {} as Record<string, unknown> } }));

vi.mock('react-native', async () => {
  const { createElement } = await import('react');
  return {
    View: ({ children, style, testID }: { children: ReactNode; style: Record<string, unknown>; testID?: string }) => {
      if (testID === 'session-summary-title') layout.value = style;
      return createElement('div', null, children);
    },
  };
});
vi.mock('@/components/presentation/foundation/item-title', async () => {
  const { createElement } = await import('react');
  return { default: ({ title }: { title: string }) => createElement('span', null, title) };
});
vi.mock('@/components/presentation/foundation/surface-text', async () => {
  const { createElement } = await import('react');
  return { SurfaceText: ({ children }: { children: ReactNode }) => createElement('span', null, children) };
});
vi.mock('@/components/presentation/summary/format-exercise-summary', () => ({ formatSessionVolume: () => '' }));
vi.mock('@/hooks/useFormatDate', () => ({ useFormatDate: () => () => '' }));
vi.mock('@/hooks/useAppTheme', () => ({ spacing: { 0.5: 2, 2: 8 } }));
vi.mock('@js-joda/core', () => ({ LocalDate: { now: () => ({ year: () => 2026 }) } }));

it('renders the complete workout name without clipping the title container (#914)', () => {
  const session = {
    blueprint: { name: 'GTP 32b UK' },
    date: { year: () => 2026 },
  } as unknown as Session;
  const html = renderToStaticMarkup(<SessionSummaryTitle session={session} />);

  expect(html).toContain('GTP 32b UK');
  expect(layout.value).toMatchObject({ flexShrink: 1, minWidth: 0, alignItems: 'stretch' });
  expect(layout.value).not.toHaveProperty('overflow', 'hidden');
});
