import { Backend } from '@/models/backend';
import { backupProbeHeader, probeBackendFeatures, probeBackupEndpoint } from '@/services/backend-probe';
import { afterEach, describe, expect, it, vi } from 'vitest';

const backend: Backend = {
  id: 'self',
  name: 'Home server',
  url: 'https://liftlog.example.com',
  kind: 'liftlog',
  headers: [{ name: 'X-Api-Key', value: 'secret' }],
};

function respondWith(response: Partial<Response> | Error) {
  const fetchMock = vi.fn((..._args: unknown[]) =>
    response instanceof Error ? Promise.reject(response) : Promise.resolve(response),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function responded(body: string, init?: Partial<Response> & { contentType?: string }): Partial<Response> {
  const { contentType, ...rest } = init ?? {};
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(contentType ? { 'content-type': contentType } : {}),
    text: () => Promise.resolve(body),
    ...rest,
  };
}

function ok(body: unknown): Partial<Response> {
  return responded(JSON.stringify(body), { contentType: 'application/json' });
}

afterEach(() => vi.unstubAllGlobals());

describe('probeBackendFeatures', () => {
  it('asks /features with the backend headers', async () => {
    const fetchMock = respondWith(ok({ feed: true }));

    await probeBackendFeatures(backend);

    expect(fetchMock).toHaveBeenCalledWith('https://liftlog.example.com/features', {
      headers: { 'X-Api-Key': 'secret' },
    });
  });

  it('reports only the features that are switched on', async () => {
    respondWith(ok({ feed: true, aiPlanner: false, backup: true }));

    expect(await probeBackendFeatures(backend)).toEqual({ status: 'ok', features: ['feed', 'backup'] });
  });

  it('is unreachable when the request fails outright, and says why', async () => {
    respondWith(new TypeError('Network request failed'));

    expect(await probeBackendFeatures(backend)).toEqual({
      status: 'unreachable',
      error: 'Network request failed',
    });
  });

  it('reports the status and the body when the server answers with an error', async () => {
    respondWith(
      responded('{"error":"invalid api key"}', {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        contentType: 'application/json',
      }),
    );

    expect(await probeBackendFeatures(backend)).toEqual({
      status: 'notLiftLog',
      failure: {
        kind: 'httpError',
        statusCode: 401,
        statusText: 'Unauthorized',
        body: '{"error":"invalid api key"}',
      },
    });
  });

  // Anything with a web server on it answers 200 with a page. That is not an answer to this question.
  it('reports the content type and the body when the answer is not JSON', async () => {
    respondWith(responded('<!doctype html>\n<html>\n  <body>Hello</body>\n</html>', { contentType: 'text/html' }));

    expect(await probeBackendFeatures(backend)).toEqual({
      status: 'notLiftLog',
      failure: {
        kind: 'notJson',
        contentType: 'text/html',
        body: '<!doctype html> <html> <body>Hello</body> </html>',
      },
    });
  });

  it('reports the body when the answer is JSON but not a feature object', async () => {
    respondWith(ok(['feed']));
    expect(await probeBackendFeatures(backend)).toEqual({
      status: 'notLiftLog',
      failure: { kind: 'notFeatureObject', body: '["feed"]' },
    });

    respondWith(ok(null));
    expect(await probeBackendFeatures(backend)).toEqual({
      status: 'notLiftLog',
      failure: { kind: 'notFeatureObject', body: 'null' },
    });
  });

  it('trims a long body down to something that fits under a text field', async () => {
    respondWith(responded('x'.repeat(500), { contentType: 'text/html' }));

    const result = await probeBackendFeatures(backend);

    expect(result).toMatchObject({ status: 'notLiftLog' });
    expect(result.status === 'notLiftLog' && result.failure.body).toBe(`${'x'.repeat(200)}...`);
  });
});

describe('probeBackupEndpoint', () => {
  it('posts an empty body, marked as a probe, with the backend headers', async () => {
    const fetchMock = respondWith(responded(''));

    await probeBackupEndpoint({ ...backend, kind: 'backupEndpoint', url: 'https://example.com/lambda' });

    expect(fetchMock).toHaveBeenCalledWith('https://example.com/lambda', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        [backupProbeHeader]: 'true',
        'X-Api-Key': 'secret',
      },
      body: new Uint8Array(),
    });
  });

  // A LiftLog backend's URL is a base, so its backups - and this probe - go to /backup on it.
  it('probes /backup on a liftlog backend', async () => {
    const fetchMock = respondWith(responded(''));

    await probeBackupEndpoint(backend);

    expect(fetchMock).toHaveBeenCalledWith('https://liftlog.example.com/backup', expect.anything());
  });

  it('reports the status and the body when the endpoint refuses', async () => {
    respondWith(responded('Missing token', { ok: false, status: 401, statusText: 'Unauthorized' }));

    expect(await probeBackupEndpoint(backend)).toEqual({
      status: 'refused',
      statusCode: 401,
      statusText: 'Unauthorized',
      body: 'Missing token',
    });
  });

  it('is unreachable when the request fails outright, and says why', async () => {
    respondWith(new TypeError('Network request failed'));

    expect(await probeBackupEndpoint(backend)).toEqual({
      status: 'unreachable',
      error: 'Network request failed',
    });
  });
});
