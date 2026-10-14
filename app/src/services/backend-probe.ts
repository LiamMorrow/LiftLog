import { Backend, backendHeaderRecord, backupUrl, featuresUrl } from '@/models/backend';

/** Why a server's answer was not a feature report. Each case is something a user can act on. */
export type BackendProbeFailure =
  | { kind: 'httpError'; statusCode: number; statusText: string; body: string }
  | { kind: 'notJson'; contentType: string; body: string }
  | { kind: 'notFeatureObject'; body: string };

export type BackendProbeResult =
  | { status: 'ok'; features: string[] }
  | { status: 'notLiftLog'; failure: BackendProbeFailure }
  | { status: 'unreachable'; error: string };

/** Long enough to recognise a login page or an error payload, short enough to sit under a text field. */
const bodySnippetLength = 200;

function snippet(body: string): string {
  const collapsed = body.replace(/\s+/g, ' ').trim();
  return collapsed.length > bodySnippetLength ? `${collapsed.slice(0, bodySnippetLength)}...` : collapsed;
}

async function readBody(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Asks a LiftLog backend what it serves. A server that cannot answer this is not one of ours, and
 * that rules out every feature - a LiftLog backend's URL is a base, so its backups would be posted
 * to `/backup` on the very server that just failed to answer.
 *
 * A failure carries what the server actually said: the wrong address, an auth header the server
 * rejects and a reverse proxy serving its own page all look identical without it.
 */
export async function probeBackendFeatures(backend: Backend): Promise<BackendProbeResult> {
  let response: Response;
  try {
    response = await fetch(featuresUrl(backend), { headers: backendHeaderRecord(backend) });
  } catch (error) {
    return { status: 'unreachable', error: errorMessage(error) };
  }
  const body = await readBody(response);
  if (!response.ok) {
    return {
      status: 'notLiftLog',
      failure: {
        kind: 'httpError',
        statusCode: response.status,
        statusText: response.statusText,
        body: snippet(body),
      },
    };
  }
  let features: unknown;
  try {
    features = JSON.parse(body);
  } catch {
    return {
      status: 'notLiftLog',
      failure: {
        kind: 'notJson',
        contentType: response.headers.get('content-type') ?? '',
        body: snippet(body),
      },
    };
  }
  if (typeof features !== 'object' || features === null || Array.isArray(features)) {
    return { status: 'notLiftLog', failure: { kind: 'notFeatureObject', body: snippet(body) } };
  }
  return {
    status: 'ok',
    features: Object.entries(features)
      .filter(([, enabled]) => enabled === true)
      .map(([feature]) => feature),
  };
}

/** Lets a server answer a probe without storing an empty backup. Documented in docs/RemoteBackup.md. */
export const backupProbeHeader = 'X-LiftLog-Probe';

export type BackupProbeResult =
  | { status: 'ok' }
  | { status: 'refused'; statusCode: number; statusText: string; body: string }
  | { status: 'unreachable'; error: string };

/**
 * Posts an empty body where a backup would go. The protocol is a bare POST with no handshake, so this
 * is as close as a check gets without uploading the database: it proves the address, the headers and
 * the method. A server that honours the probe header answers without writing anything
 */
export async function probeBackupEndpoint(backend: Backend): Promise<BackupProbeResult> {
  let response: Response;
  try {
    response = await fetch(backupUrl(backend), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        [backupProbeHeader]: 'true',
        ...backendHeaderRecord(backend),
      },
      body: new Uint8Array(),
    });
  } catch (error) {
    return { status: 'unreachable', error: errorMessage(error) };
  }
  if (response.ok) {
    return { status: 'ok' };
  }
  return {
    status: 'refused',
    statusCode: response.status,
    statusText: response.statusText,
    body: snippet(await readBody(response)),
  };
}
