import type { ProgramBlueprintJSON } from './blueprint';

export interface AiPlanJSON {
  name: string;
  description: string;
  blueprint: ProgramBlueprintJSON;
}
