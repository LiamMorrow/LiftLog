import { AppIconSource } from '@/components/presentation/foundation/ms-icon-source';
import type { RootState } from '@/store';
import { TranslationKey } from '@tolgee/react';
import { Href } from 'expo-router';

export interface WhatsNewEntry {
  id: number;
  icon: AppIconSource;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  cta?: {
    labelKey: TranslationKey;
    route: Href;
  };
  /** When provided, the entry is only surfaced while this returns true (e.g. hide once adopted). */
  condition?: (state: RootState) => boolean;
}

// Append-only; ids must stay monotonic since the highest id drives the unread state.
// Announce sparingly: only features that need enabling/opt-in, or would warrant a spot in the welcome
// wizard. Skip incremental changes users find along the app's hot paths (e.g. new per-exercise options).
export const whatsNewEntries: WhatsNewEntry[] = [
  {
    id: 1,
    icon: 'heartCheck',
    titleKey: 'whats_new.health_sync.title',
    bodyKey: 'whats_new.health_sync.body',
    cta: {
      labelKey: 'whats_new.health_sync.cta',
      route: '/settings/backup-and-restore',
    },
    condition: (state) => !state.settings.exportToHealthAggregator,
  },
  {
    id: 2,
    icon: 'assignment',
    titleKey: 'whats_new.plan_files.title',
    bodyKey: 'whats_new.plan_files.body',
    cta: {
      labelKey: 'whats_new.plan_files.cta',
      route: '/settings/program-list',
    },
  },
];

export const latestWhatsNewId = whatsNewEntries.reduce((max, entry) => Math.max(max, entry.id), 0);
