using System.Text.Json.Serialization;
using LiftLog.Lib;
using LiftLog.Ui.Models.SessionBlueprintDao;
using LiftLog.Ui.Models.SessionHistoryDao;

namespace LiftLog.Ui.Models.ExportedDataDao;

internal record ExportedDataDaoV1(
    List<SessionDaoV1> Sessions,
    ImmutableListValue<SessionBlueprintDaoV1> Program
);
