import { isFileUri } from '@/hooks/useIncomingPlanFile';

/**
 * File and content URIs are plan files the OS asked us to open, not routes -
 * `useIncomingPlanFile` imports them. Returning null stops expo-router matching
 * them as a path and landing on the not-found screen.
 *
 * expo-router drops the `#fragment` from custom-scheme URLs but keeps it on
 * https ones, and shared-item links carry their key in the fragment.
 */
export function redirectSystemPath({ path }: { path: string; initial: boolean }): string | null {
  return isFileUri(path) ? null : path.replace(/^liftlog:\/\//, 'https://app.liftlog.online/');
}
