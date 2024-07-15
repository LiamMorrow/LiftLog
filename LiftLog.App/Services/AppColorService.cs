using LiftLog.Ui.Models;
using LiftLog.Ui.Store.App;
using MaterialColorUtilities.Maui;
using MaterialColorUtilities.Schemes;
using Microsoft.Extensions.Options;

namespace LiftLog.App.Services;

public class AppColorService(
    IOptions<MaterialColorOptions> options,
    IDynamicColorService dynamicColorService,
    IPreferences preferences,
    Fluxor.IDispatcher dispatcher
)
    : MaterialColorService<
        AppCorePalette,
        AppColorScheme<uint>,
        Scheme<Color>,
        AppLightSchemeMapper,
        AppDarkSchemeMapper
    >(options, dynamicColorService, preferences)
{
    protected override void Apply()
    {
        base.Apply();
        dispatcher.Dispatch(new ThemeColorUpdatedAction(SchemeInt, IsDark));
    }
}
