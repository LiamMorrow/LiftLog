import { describe, it, expect } from 'vitest';
import { Backend } from '@/models/backend';
import { builtInBackend, selectBackendForFeature } from '@/store/backends';
import type { RootState } from '@/store/store';

const selfHosted: Backend = {
  id: 'self',
  name: 'Home server',
  url: 'https://liftlog.example.com',
  kind: 'liftlog',
  headers: [{ name: 'X-Api-Key', value: 'secret' }],
};

const bareBackupServer: Backend = {
  id: 'bare',
  name: 'Lambda',
  url: 'https://example.com/some/path',
  kind: 'backupEndpoint',
  headers: [],
};

function stateWith(overrides: Partial<RootState['backends']> = {}): RootState {
  return {
    backends: { backends: [], assignments: {}, isHydrated: true, ...overrides },
    settings: { proToken: 'hi' },
  } as RootState;
}

describe('selectResolvedBackend', () => {
  it('refuses to resolve before the slice is hydrated', () => {
    const state = stateWith({ isHydrated: false, assignments: { backup: 'self' }, backends: [selfHosted] });

    expect(selectBackendForFeature(state, 'backup')).toBeUndefined();
    expect(selectBackendForFeature(state, 'feed')).toBeUndefined();
  });

  // Nothing is implied by a missing assignment - `seedBackendAssignments` writes the rows that put
  // feed and the AI planner on ours, so an unassigned feature genuinely has nowhere to go.
  it('leaves every feature unresolved until it is assigned', () => {
    const state = stateWith();

    expect(selectBackendForFeature(state, 'feed')).toBeUndefined();
    expect(selectBackendForFeature(state, 'aiPlanner')).toBeUndefined();
    expect(selectBackendForFeature(state, 'backup')).toBeUndefined();
  });

  it('resolves a feature assigned to the built-in backend', () => {
    const state = stateWith({ assignments: { feed: builtInBackend.id } });

    expect(selectBackendForFeature(state, 'feed')?.backend.id).toBe(builtInBackend.id);
    expect(selectBackendForFeature(state, 'feed')?.isBuiltIn).toBe(true);
  });

  // We do not hold anyone's backup, so ours is not somewhere a backup can be pointed.
  it('will not serve backup from the built-in backend', () => {
    expect(
      selectBackendForFeature(stateWith({ assignments: { backup: builtInBackend.id } }), 'backup'),
    ).toBeUndefined();

    const assigned = stateWith({ backends: [selfHosted], assignments: { backup: 'self' } });
    expect(selectBackendForFeature(assigned, 'backup')?.backend.id).toBe('self');
  });

  it('carries the backend headers through', () => {
    const state = stateWith({ backends: [selfHosted], assignments: { feed: 'self' } });

    expect(selectBackendForFeature(state, 'feed')?.headers).toEqual({ 'X-Api-Key': 'secret' });
  });

  it('sends the pro token to the built-in planner in the format the server parses', () => {
    const state = stateWith({ assignments: { aiPlanner: builtInBackend.id } });

    const resolved = selectBackendForFeature(state, 'aiPlanner');

    expect(resolved?.headers).toEqual({ Authorization: 'Bearer RevenueCat hi' });
    expect(resolved?.requiresPro).toBe(false);
  });

  it('keeps the pro token off a self-hosted planner', () => {
    const state = stateWith({ backends: [selfHosted], assignments: { aiPlanner: 'self' } });

    expect(selectBackendForFeature(state, 'aiPlanner')?.headers).toEqual({ 'X-Api-Key': 'secret' });
  });

  it('resolves nothing when an assignment dangles', () => {
    const state = stateWith({ backends: [], assignments: { feed: 'deleted-backend' } });

    expect(selectBackendForFeature(state, 'feed')).toBeUndefined();
  });

  it('will not serve the feed from a backup-only endpoint', () => {
    const state = stateWith({ backends: [bareBackupServer], assignments: { feed: 'bare' } });

    expect(selectBackendForFeature(state, 'feed')).toBeUndefined();
    expect(
      selectBackendForFeature(stateWith({ backends: [bareBackupServer], assignments: { backup: 'bare' } }), 'backup')
        ?.backend.id,
    ).toBe('bare');
  });
});
