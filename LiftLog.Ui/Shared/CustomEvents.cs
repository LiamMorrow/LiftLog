using Microsoft.AspNetCore.Components;

namespace LiftLog.Ui.Shared;

[EventHandler("ondialog-close", typeof(Object), enableStopPropagation: false, enablePreventDefault: false)]
public static class EventHandlers
{
}
