namespace LiftLog.Ui.Shared.Presentation;

public partial class RestTimer : IDisposable
{
    private const string TimespanFormatStr = @"m\:ss";
    private Timer? _timer;
    private bool _disposedValue;

    protected override void OnAfterRender(bool firstRender)
    {
        base.OnAfterRender(firstRender);
        if (firstRender)
        {
            _timer = new Timer(
                _ =>
                {
                    InvokeAsync(StateHasChanged);
                },
                null,
                TimeSpan.FromMilliseconds(200),
                TimeSpan.FromMilliseconds(200)
            );
        }
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposedValue)
        {
            if (disposing)
            {
                _timer?.Dispose();
            }

            _disposedValue = true;
        }
    }

    public void Dispose()
    {
        // Do not change this code. Put cleanup code in 'Dispose(bool disposing)' method
        Dispose(disposing: true);
        GC.SuppressFinalize(this);
    }
}
