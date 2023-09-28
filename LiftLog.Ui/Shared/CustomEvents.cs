using Microsoft.AspNetCore.Components;

namespace LiftLog.Ui.Shared;

[EventHandler(
    "ondialog-close",
    typeof(Object),
    enableStopPropagation: false,
    enablePreventDefault: false
)]
[EventHandler(
    "onlist-item-click",
    typeof(Object),
    enableStopPropagation: false,
    enablePreventDefault: false
)]
[EventHandler(
    "onslider-change",
    typeof(SliderChangeEventArgs),
    enableStopPropagation: false,
    enablePreventDefault: false
)]
public static class EventHandlers { }

public class SliderChangeEventArgs : EventArgs
{
    public int Value { get; set; }
}
