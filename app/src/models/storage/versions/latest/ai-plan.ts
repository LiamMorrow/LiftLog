import type { ProgramBlueprintJSON } from './blueprint';

export interface AiPlanJSON {
  version: 2;
  /**
   * A short name for the plan.
   */
  name: string;
  /**
   * A description of the plan, with recommendations for the user's skill level
   * and goals.
   */
  description: string;
  blueprint: ProgramBlueprintJSON;
}
