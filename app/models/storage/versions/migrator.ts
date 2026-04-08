import { LiftLog } from '@/gen/proto';
import {
  LatestVersion,
  ProgramBlueprintJSON,
  SessionBlueprintJSON,
  SessionJSON,
} from './latest';
import { MigratorV0ToV1 } from './v1/migrator';
import { AnyVersionProgramBlueprintJSON, AnyVersionSessionJSON } from './any';

export class MigratorV0ToLatest {
  static migrateProgramBlueprint(
    value: LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoV1,
  ): ProgramBlueprintJSON {
    return MigratorV0ToV1.migrateProgramBlueprint(value);
  }

  static migrateSession(
    value: LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2,
  ): SessionJSON {
    return MigratorV0ToV1.migrateSession(value);
  }

  static migrateSessionBlueprint(
    value: LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2,
  ): SessionBlueprintJSON {
    return MigratorV0ToV1.migrateSessionBlueprint(value);
  }
}

export class MigratorVAnyToLatest {
  static migrateProgram(
    modelVersion: number,
    value: AnyVersionProgramBlueprintJSON,
  ): ProgramBlueprintJSON {
    if (modelVersion === LatestVersion) {
      return value;
    }
    if (modelVersion < 1) {
      throw new Error(`Unknown model version ${modelVersion}`);
    }
    // The idea is when we have more, we can run the specific migrations from say V1 -> V2 incrementing the model version recursively, but let's see
    throw new Error(`Unknown model version ${modelVersion}`);
  }

  static migrateSession(
    modelVersion: number,
    value: AnyVersionSessionJSON,
  ): SessionJSON {
    if (modelVersion === LatestVersion) {
      return value;
    }
    if (modelVersion < 1) {
      throw new Error(`Unknown model version ${modelVersion}`);
    }
    // The idea is when we have more, we can run the specific migrations from say V1 -> V2 incrementing the model version recursively, but let's see
    throw new Error(`Unknown model version ${modelVersion}`);
  }
}
