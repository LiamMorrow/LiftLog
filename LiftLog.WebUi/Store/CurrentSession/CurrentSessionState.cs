using System;
using LiftLog.Lib.Models;
using LiftLog.Lib.Services;

namespace LiftLog.WebUi.Store.CurrentSession
{
    public record CurrentSessionState(Session? Session, NotificationHandle? SetTimerNotificationHandle);
}
