import { initializeAiPlannerStateSlice } from '@/store/ai-planner';
import { setIsHydrated } from '@/store/ai-planner';
import { addEffect } from '@/store/store';

export function applyAiPlannerEffects() {
  addEffect(initializeAiPlannerStateSlice, async (_, { dispatch }) => {
    dispatch(setIsHydrated(true));
  });
}
