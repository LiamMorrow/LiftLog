import { AiPlanJSON as InitialAiPlanJSON } from '@/models/storage/versions/initial';
import { programBlueprintMigrations } from '@/models/storage/versions/migrations/blueprint';
import { createMigrations } from './migrator';
import type * as Latest from '@/models/storage/versions/latest/ai-plan';

export const aiPlanMigrations = createMigrations<InitialAiPlanJSON>()
  .add((value) => ({
    version: 2,
    name: value.name,
    description: value.description,
    blueprint: programBlueprintMigrations.migrateUntil(value.blueprint, 2),
  }))
  .build<Latest.AiPlanJSON>();
