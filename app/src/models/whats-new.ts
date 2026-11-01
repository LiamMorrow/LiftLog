import AssignmentIcon from '@expo/material-symbols/assignment.xml';
import DnsIcon from '@expo/material-symbols/dns.xml';
import HeartCheckIcon from '@expo/material-symbols/heart_check.xml';
import PodcastsIcon from '@expo/material-symbols/podcasts.xml';
import type { RootState } from '@/store';
import { TranslationKey } from '@tolgee/react';
import { Href } from 'expo-router';
import { ImageSourcePropType } from 'react-native';
import { SFSymbol } from 'sf-symbols-typescript';

export interface WhatsNewEntry {
  id: number;
  icon: ImageSourcePropType;
  systemImage: SFSymbol;
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
    icon: HeartCheckIcon,
    systemImage: 'heart.text.square',
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
    icon: AssignmentIcon,
    systemImage: 'doc.text',
    titleKey: 'whats_new.plan_files.title',
    bodyKey: 'whats_new.plan_files.body',
    cta: {
      labelKey: 'whats_new.plan_files.cta',
      route: '/settings/program-list',
    },
  },
  {
    id: 3,
    icon: DnsIcon,
    systemImage: 'server.rack',
    titleKey: 'whats_new.backends.title',
    bodyKey: 'whats_new.backends.body',
    cta: {
      labelKey: 'whats_new.backends.cta',
      route: '/settings/backends',
    },
    condition: (state) => state.backends.backends.length === 0,
  },
  {
    id: 4,
    icon: PodcastsIcon,
    systemImage: 'dot.radiowaves.left.and.right',
    titleKey: 'whats_new.live_workouts.title',
    bodyKey: 'whats_new.live_workouts.body',
    cta: {
      labelKey: 'whats_new.live_workouts.cta',
      route: { pathname: '/settings/feed', params: { focus: 'live' } },
    },
    condition: (state) =>
      state.settings.showFeed &&
      Object.values(state.feed.friends).some((friend) => friend.status === 'friend') &&
      !state.feed.identity.unwrapOr(undefined)?.shareLiveWorkouts,
  },
];

export const latestWhatsNewId = whatsNewEntries.reduce((max, entry) => Math.max(max, entry.id), 0);
