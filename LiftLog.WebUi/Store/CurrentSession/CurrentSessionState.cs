using System;
using LiftLog.Lib.Models;

namespace LiftLog.WebUi.Store.CurrentSession
{
    public record CurrentSessionState(SessionAndBlueprint? SessionAndBlueprint);

    public record SessionAndBlueprint(Session Session, SessionBlueprint Blueprint);
}
