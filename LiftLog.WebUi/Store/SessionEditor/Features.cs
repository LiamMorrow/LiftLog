using System.Collections.Immutable;
using Fluxor;
using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.WebUi.Store.SessionEditor;

public class SessionEditorFeature : Feature<SessionEditorState>
{
    public override string GetName() => nameof(SessionEditorFeature);

    protected override SessionEditorState GetInitialState() => new(null);
}
