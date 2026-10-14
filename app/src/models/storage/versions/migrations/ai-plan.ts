import { AiPlanJSON as InitialAiPlanJSON } from '@/models/storage/versions/initial';
import { programBlueprintMigrations } from '@/models/storage/versions/migrations/blueprint';
import { createMigrations } from './migrator';
import type * as Latest from '@/models/storage/versions/latest/ai-plan';

export const aiPlanMigrations = createMigrations<InitialAiPlanJSON>({ pseudoMigrateUntil: 3 })
  .dependsOn({
    blueprint: programBlueprintMigrations,
  })
  .build<Latest.AiPlanJSON>();
