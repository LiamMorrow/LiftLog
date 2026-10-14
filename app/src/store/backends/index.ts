import {
  Backend,
  BackendAssignments,
  BackendFeature,
  BackendHeader,
  backendHeaderRecord,
  BackendId,
  backendSupportsFeature,
  builtInBackendId,
  isBackendComplete,
  ResolvedBackendForFeature,
} from '@/models/backend';
import { apiBaseUrl } from '@/services/api-consts';
import { SettingsRootState } from '@/store/settings';
import { createAction, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

/** Not stored in the slice - it is not something the user created, and it cannot be edited away. */
export const builtInBackend: Backend = {
  id: builtInBackendId,
  name: 'LiftLog',
  url: apiBaseUrl,
  kind: 'liftlog',
  headers: [],
};

interface BackendsState {
  /** User-created backends only. The built-in LiftLog backend is not stored. */
  backends: Backend[];
  assignments: BackendAssignments;
  isHydrated: boolean;
}

/** What the exported selectors need off the root state. */
type BackendsRootState = { backends: BackendsState };

const initialState: BackendsState = {
  backends: [],
  assignments: {},
  isHydrated: false,
};

const backendsSlice = createSlice({
  name: 'backends',
  initialState,
  reducers: {
    setBackends(state, action: PayloadAction<Backend[]>) {
      state.backends = action.payload;
    },
    setBackendAssignments(state, action: PayloadAction<BackendAssignments>) {
      state.assignments = action.payload;
    },
    setBackendsHydrated(state, action: PayloadAction<boolean>) {
      state.isHydrated = action.payload;
    },
    putBackend(state, action: PayloadAction<Backend>) {
      const index = state.backends.findIndex((x) => x.id === action.payload.id);
      if (index === -1) {
        state.backends.push(action.payload);
      } else {
        state.backends[index] = action.payload;
      }
    },
    removeBackend(state, action: PayloadAction<BackendId>) {
      state.backends = state.backends.filter((x) => x.id !== action.payload);
      for (const [feature, backendId] of Object.entries(state.assignments)) {
        if (backendId === action.payload) {
          delete state.assignments[feature as BackendFeature];
        }
      }
    },
    setBackendAssignment(state, action: PayloadAction<{ feature: BackendFeature; backendId: BackendId }>) {
      state.assignments[action.payload.feature] = action.payload.backendId;
    },
    clearBackendAssignment(state, action: PayloadAction<BackendFeature>) {
      delete state.assignments[action.payload];
    },
  },
  selectors: {
    selectUserBackends: (state: BackendsState) => state.backends,
    selectBackendAssignments: (state: BackendsState) => state.assignments,
    selectBackendsAreHydrated: (state: BackendsState) => state.isHydrated,
  },
});

export const initializeBackendsStateSlice = createAction('initializeBackendsStateSlice');

/**
 * Repointing the feed destroys the account: identity, followers and follow secrets are issued by the
 * server that holds them, and the protocol has no federation. Handled in `store/feed/effects.ts`.
 */
export const switchFeedBackend = createAction<{ backendId: BackendId }>('switchFeedBackend');

export const {
  setBackends,
  setBackendAssignments,
  setBackendsHydrated,
  putBackend,
  removeBackend,
  setBackendAssignment,
  clearBackendAssignment,
} = backendsSlice.actions;

export const { selectUserBackends, selectBackendAssignments, selectBackendsAreHydrated } = backendsSlice.selectors;

export const selectAllBackends = createSelector(selectUserBackends, (backends): Backend[] => [
  builtInBackend,
  ...backends,
]);

export const selectAllowedBackendsForFeature = createSelector(
  selectAllBackends,
  (_: BackendsRootState, feature: BackendFeature) => feature,
  (backends, feature) =>
    backends.filter((backend) => backendSupportsFeature(backend, feature) && isBackendComplete(backend)),
);

function backendFor(
  backends: Backend[],
  assignments: BackendAssignments,
  feature: BackendFeature,
): Backend | undefined {
  const backend = backends.find((x) => x.id === assignments[feature]);
  return backend && backendSupportsFeature(backend, feature) ? backend : undefined;
}

export const selectAssignedBackendId = createSelector(
  selectBackendAssignments,
  (_: BackendsRootState, feature: BackendFeature) => feature,
  (assignments, feature) => assignments[feature],
);

/** Which backend serves a feature, or undefined when nothing can serve it yet. */
export const selectBackendForFeature = createSelector(
  selectAllBackends,
  selectBackendAssignments,
  selectBackendsAreHydrated,
  (state: SettingsRootState) => state.settings.proToken,
  (_: BackendsRootState, feature: BackendFeature) => feature,
  (backends, assignments, isHydrated, proToken, feature): ResolvedBackendForFeature | undefined => {
    const backend = isHydrated ? backendFor(backends, assignments, feature) : undefined;
    if (!backend) {
      return undefined;
    }
    const isBuiltIn = backend.id === builtInBackendId;
    const usesProToken = isBuiltIn && feature === 'aiPlanner';
    const requiresProToken = usesProToken && !proToken;
    return {
      backend,
      url: backend.url,
      requiresPro: requiresProToken,
      headers: backendHeaderRecord({
        ...backend,
        headers: [...backend.headers, ...(usesProToken ? getProTokenHeaders(proToken) : [])],
      }),
      isBuiltIn: backend.id === builtInBackendId,
    };
  },
);

export const backendsReducer = backendsSlice.reducer;

function getProTokenHeaders(proToken: string | undefined): BackendHeader[] {
  if (!proToken) {
    return [];
  }
  if (__DEV__) {
    return [{ name: 'X-API-Key', value: proToken }];
  }
  return [{ name: 'Authorization', value: `Bearer RevenueCat ${proToken}` }];
}
