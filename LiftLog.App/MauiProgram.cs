using Microsoft.Extensions.Logging;

namespace LiftLog.App
{
    public static partial class MauiProgram
    {
        public static MauiApp CreateMauiApp()
        {
            var builder = MauiApp.CreateBuilder();
            builder.UseMauiApp<App>()
                   .ConfigureFonts(fonts =>
                   {
                       fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                       fonts.AddFont("OpenSans-SemiBold.ttf", "OpenSansSemiBold");
                   });
            builder.Services.AddMauiBlazorWebView();

#if DEBUG
            builder.Logging.AddDebug();
#endif

            return builder.Build();
        }
    }
}
