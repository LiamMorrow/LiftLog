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
    typeof(object),
    enableStopPropagation: false,
    enablePreventDefault: false
)]
[EventHandler(
    "onpull-to-refresh",
    typeof(object),
    enableStopPropagation: false,
    enablePreventDefault: false
)]
[EventHandler(
    "onsegmented-button-interaction",
    typeof(object),
    enableStopPropagation: false,
    enablePreventDefault: false
)]
public static class EventHandlers { }
