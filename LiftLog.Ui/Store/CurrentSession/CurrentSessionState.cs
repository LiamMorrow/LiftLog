using LiftLog.Lib.Models;
using LiftLog.Lib.Services;

namespace LiftLog.Ui.Store.CurrentSession
{
    public record CurrentSessionState(Session? Session, NotificationHandle? SetTimerNotificationHandle);
}
