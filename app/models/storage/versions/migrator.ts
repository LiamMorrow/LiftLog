import { LiftLog } from '@/gen/proto';
import {
  ProgramBlueprintJSON,
  SessionBlueprintJSON,
  SessionJSON,
} from './latest';
import { MigratorV0ToV1 } from './v1/migrator';

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
