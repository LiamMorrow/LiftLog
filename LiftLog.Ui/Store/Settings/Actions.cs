using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Settings;

public record ExportDataAction();
public record ImportDataAction(string DataJson);