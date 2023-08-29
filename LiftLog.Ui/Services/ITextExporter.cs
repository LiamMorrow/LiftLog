namespace LiftLog.Ui.Services;

public interface ITextExporter
{
    Task ExportTextAsync(string text);
    Task<string> ImportTextAsync();
}
