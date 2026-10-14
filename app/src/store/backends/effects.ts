import { backendAssignmentsSchema, backendHeadersSchema, backendsSchema } from '@/db/schema';
import { Backend } from '@/models/backend';
import {
  clearBackendAssignment,
  initializeBackendsStateSlice,
  putBackend,
  removeBackend,
  setBackendAssignment,
  setBackendAssignments,
  setBackends,
  setBackendsHydrated,
} from '@/store/backends';
import { initializeAiPlannerStateSlice } from '@/store/ai-planner';
import { initializeFeedStateSlice } from '@/store/feed';
import { AddEffectFn } from '@/store/store';
import { eq } from 'drizzle-orm';

export function applyBackendsEffects(addEffect: AddEffectFn) {
  addEffect(initializeBackendsStateSlice, async (_, { cancelActiveListeners, dispatch, extra: { db, logger } }) => {
    cancelActiveListeners();
    await logger.time('initializeBackends', async () => {
      const [backendRows, headerRows, assignmentRows] = await Promise.all([
        db.select().from(backendsSchema),
        db.select().from(backendHeadersSchema),
        db.select().from(backendAssignmentsSchema),
      ]);

      const backends: Backend[] = backendRows.map((row) => ({
        id: row.id,
        name: row.name,
        url: row.url,
        kind: row.kind,
        headers: headerRows.filter((header) => header.backendId === row.id).map(({ name, value }) => ({ name, value })),
      }));

      dispatch(setBackends(backends));
      dispatch(setBackendAssignments(Object.fromEntries(assignmentRows.map((row) => [row.feature, row.backendId]))));
      dispatch(setBackendsHydrated(true));
    });
    // Started here rather than alongside the other slices: neither can reach the network before it
    // knows which backend it belongs to, and until this point `selectResolvedBackend` answers "not yet".
    dispatch(initializeFeedStateSlice());
    dispatch(initializeAiPlannerStateSlice());
  });

  addEffect(putBackend, async (action, { stateAfterReduce, extra: { db } }) => {
    if (!stateAfterReduce.backends.isHydrated) {
      return;
    }
    const { id, name, url, kind, headers } = action.payload;
    db.transaction((tx) => {
      tx.insert(backendsSchema)
        .values({ id, name, url, kind })
        .onConflictDoUpdate({ target: backendsSchema.id, set: { name, url, kind } })
        .run();
      tx.delete(backendHeadersSchema).where(eq(backendHeadersSchema.backendId, id)).run();
      const rows = headers.filter((header) => header.name.trim());
      if (rows.length) {
        tx.insert(backendHeadersSchema)
          .values(rows.map(({ name: headerName, value }) => ({ backendId: id, name: headerName.trim(), value })))
          .run();
      }
    });
  });

  addEffect(removeBackend, async (action, { stateAfterReduce, extra: { db } }) => {
    if (!stateAfterReduce.backends.isHydrated) {
      return;
    }
    db.transaction((tx) => {
      tx.delete(backendHeadersSchema).where(eq(backendHeadersSchema.backendId, action.payload)).run();
      tx.delete(backendsSchema).where(eq(backendsSchema.id, action.payload)).run();
      tx.delete(backendAssignmentsSchema).where(eq(backendAssignmentsSchema.backendId, action.payload)).run();
    });
  });

  addEffect(setBackendAssignment, async (action, { stateAfterReduce, extra: { db } }) => {
    if (!stateAfterReduce.backends.isHydrated) {
      return;
    }
    const { feature, backendId } = action.payload;
    await db
      .insert(backendAssignmentsSchema)
      .values({ feature, backendId })
      .onConflictDoUpdate({ target: backendAssignmentsSchema.feature, set: { backendId } });
  });

  addEffect(clearBackendAssignment, async (action, { stateAfterReduce, extra: { db } }) => {
    if (!stateAfterReduce.backends.isHydrated) {
      return;
    }
    await db.delete(backendAssignmentsSchema).where(eq(backendAssignmentsSchema.feature, action.payload));
  });
}
