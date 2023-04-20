using Fluxor;

namespace LiftLog.Ui.Store.SessionEditor;

public class SessionEditorFeature : Feature<SessionEditorState>
{
    public override string GetName() => nameof(SessionEditorFeature);

    protected override SessionEditorState GetInitialState() => new(null);
}
