import { createAction } from '@reduxjs/toolkit';

export const setStatsIsDirty = createAction<boolean>('setStatsIsDirty');
