

using System.Text.Json.Serialization;
using LiftLog.Lib.Models;
using LiftLog.Lib.Serialization;
using LiftLog.Ui.Models.SessionBlueprintDao;
using LiftLog.Ui.Models.SessionHistoryDao;
using LiftLog.Ui.Models.SettingsStorageDao;
using LiftLog.Ui.Store.CurrentSession;

[JsonSerializable(typeof(SessionBlueprintContainerDaoV1))]
[JsonSerializable(typeof(SessionHistoryDaoV1))]
[JsonSerializable(typeof(CurrentSessionState))]
[JsonSerializable(typeof(List<SessionBlueprintDaoV1>))]
[JsonSerializable(typeof(List<ExerciseBlueprintDaoV1>))]
[JsonSerializable(typeof(List<RecordedExerciseDaoV1>))]
[JsonSerializable(typeof(List<RecordedSetDaoV1>))]
[JsonSerializable(typeof(List<RecordedExercise>))]
[JsonSerializable(typeof(List<RecordedSet>))]
[JsonSerializable(typeof(List<ExerciseBlueprint>))]
[JsonSerializable(typeof(SettingsStorageDaoV1))]
[JsonSerializable(typeof(SessionDaoV1))]
internal partial class StorageJsonContext : JsonSerializerContext
{

    public static StorageJsonContext Context => new StorageJsonContext(JsonSerializerSettings.LiftLog);

}
