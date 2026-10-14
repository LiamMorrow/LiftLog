import { ChatMessage, restartChat } from '@/store/ai-planner';
import { aiPlannerReducer } from '@/store/ai-planner';
import { applyAiPlannerEffects } from '@/store/ai-planner/effects';
import { backendsReducer, removeBackend, setBackendAssignment } from '@/store/backends';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { combineReducers } from '@reduxjs/toolkit';
import { describe, expect, it, vi } from 'vitest';

const message: ChatMessage = { id: 'm1', from: 'Agent', type: 'messageResponse', message: 'Hi' };

function makeTestBed(options?: { plannerChat?: ChatMessage[]; assignedTo?: string }) {
  const plannerChat = options?.plannerChat ?? [message];
  const testBed = createAddEffectTestBed({
    reducer: combineReducers({ aiPlanner: aiPlannerReducer, backends: backendsReducer }),
    initialState: {
      aiPlanner: { plannerChat },
      backends: {
        isHydrated: true,
        backends: [{ id: 'self', name: 'Home', url: 'https://home.example.com', kind: 'liftlog', headers: [] }],
        assignments: { aiPlanner: options?.assignedTo ?? 'liftlog', feed: 'liftlog' },
      },
    },
    services: { aiChatService: { restartChat: vi.fn(), introduce: vi.fn(() => []) }, db: {} },
  });
  applyAiPlannerEffects(testBed.addEffect);
  return testBed;
}

describe('repointing the AI planner', () => {
  it('starts the chat again on the new server', async () => {
    const testBed = makeTestBed();

    await testBed.dispatchHandled(setBackendAssignment({ feature: 'aiPlanner', backendId: 'self' }));

    expect(testBed.dispatchedActions.map((x) => x.type)).toContain(restartChat.type);
    expect(testBed.getState().aiPlanner.plannerChat).toEqual([]);
  });

  it('starts the chat again when the assigned backend is deleted out from under it', async () => {
    const testBed = makeTestBed({ assignedTo: 'self' });

    await testBed.dispatchHandled(removeBackend('self'));

    expect(testBed.dispatchedActions.map((x) => x.type)).toContain(restartChat.type);
  });

  it('leaves the chat alone when the planner is reassigned to the server it is already on', async () => {
    const testBed = makeTestBed();

    await testBed.dispatchHandled(setBackendAssignment({ feature: 'aiPlanner', backendId: 'liftlog' }));

    testBed.expectNotDispatched(restartChat);
  });

  it('leaves the chat alone when another feature is repointed', async () => {
    const testBed = makeTestBed();

    await testBed.dispatchHandled(setBackendAssignment({ feature: 'feed', backendId: 'self' }));

    testBed.expectNotDispatched(restartChat);
  });

  // Nothing to restart, and introducing on a server the user has not opened the planner on is noise.
  it('does not introduce itself on the new server when there is no chat', async () => {
    const testBed = makeTestBed({ plannerChat: [] });

    await testBed.dispatchHandled(setBackendAssignment({ feature: 'aiPlanner', backendId: 'self' }));

    testBed.expectNotDispatched(restartChat);
  });
});
