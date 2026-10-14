import { toBase64, fromBase64 } from '@/utils/base64';
import { TranslationKey } from '@tolgee/react';

export type BackendId = string;

/**
 * `liftlog` - a full LiftLog backend. `url` is a base; each feature appends its own path.
 * `backupEndpoint` - a bare implementation of the backup protocol (see docs/RemoteBackup.md).
 * `url` is the literal POST target, and backup is the only feature it can serve.
 */
export type BackendKind = 'liftlog' | 'backupEndpoint';

export type BackendFeature = 'feed' | 'aiPlanner' | 'backup';

/** Everything `/features` can report, including `sharing`, which no app feature is assigned to. */
export type ReportedBackendFeature = BackendFeature | 'sharing';

export const backendFeatureNameKey: Record<ReportedBackendFeature, TranslationKey> = {
  feed: 'backends.feature.feed',
  sharing: 'backends.feature.sharing',
  aiPlanner: 'backends.feature.ai_planner',
  backup: 'backends.feature.backup',
};

export const backendFeatures: BackendFeature[] = ['feed', 'aiPlanner', 'backup'];

export function canBeSetToNoBackend(feature: BackendFeature): boolean {
  return feature === 'backup';
}

export interface BackendHeader {
  name: string;
  value: string;
}

export interface Backend {
  id: BackendId;
  name: string;
  url: string;
  kind: BackendKind;
  headers: BackendHeader[];
}

export type BackendAssignments = Partial<Record<BackendFeature, BackendId>>;

export interface ResolvedBackendForFeature {
  backend: Backend;
  url: string;
  // Contains the headers for the backend, plus the pro token header if necessary
  headers: Record<string, string>;
  isBuiltIn: boolean;
  requiresPro: boolean;
}

export const builtInBackendId = 'liftlog';

/**
 * We do not hold anyone's backup - ours serves the features we run, and a backup goes somewhere the
 * user controls. A self-hosted LiftLog server serves everything; a bare endpoint serves only backup.
 */
export function backendSupportsFeature(backend: Backend, feature: BackendFeature): boolean {
  if (backend.id === builtInBackendId) {
    return feature !== 'backup';
  }
  return backend.kind === 'liftlog' || feature === 'backup';
}

export function backendHeaderRecord(backend: Backend): Record<string, string> {
  return Object.fromEntries(
    backend.headers.filter((h) => h.name.trim() && h.value).map((h) => [h.name.trim(), h.value]),
  );
}

export function backupUrl(backend: Backend): string {
  return backend.kind === 'backupEndpoint' ? backend.url : `${backend.url}/backup`;
}

export function featuresUrl(backend: Backend): string {
  return `${backend.url}/features`;
}

export function backendUrlIsValid(url: string): boolean {
  return /^https?:\/\/.+/.test(url.trim());
}

/** An incomplete backend is one nothing could be asked of, so no feature is allowed to point at it. */
export function isBackendComplete(backend: Backend): boolean {
  return !!backend.name.trim() && backendUrlIsValid(backend.url);
}

export function normalizeBackendUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

export function basicAuthHeaderValue(username: string, password: string): string {
  return `Basic ${toBase64(`${username}:${password}`)}`;
}

export function parseBasicAuthHeaderValue(value: string): { username: string; password: string } | undefined {
  const encoded = /^Basic\s+(\S+)$/i.exec(value.trim())?.[1];
  const decoded = encoded ? fromBase64(encoded) : undefined;
  if (decoded === undefined) {
    return undefined;
  }
  const separator = decoded.indexOf(':');
  if (separator < 0) {
    return undefined;
  }
  return { username: decoded.slice(0, separator), password: decoded.slice(separator + 1) };
}
