using Microsoft.AspNetCore.Components;

namespace LiftLog.Ui.Shared.SessionComponent.RestTimer
{
    public partial class RestTimer : IDisposable
    {
        private const string TimespanFormatStr = @"mm\:ss";
        private readonly CancellationTokenSource _destroyedSource = new();
        private bool _disposedValue;

        protected override void OnAfterRender(bool firstRender)
        {
            base.OnAfterRender(firstRender);
            if (firstRender)
            {
                Task.Run(async () =>
                {
                    while (!_destroyedSource.IsCancellationRequested)
                    {
                        await InvokeAsync(StateHasChanged);
                        await Task.Delay(200);
                    }
                });
            }
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposedValue)
            {
                if (disposing)
                {
                    _destroyedSource.Cancel();
                }

                // TODO: free unmanaged resources (unmanaged objects) and override finalizer
                // TODO: set large fields to null
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
}
