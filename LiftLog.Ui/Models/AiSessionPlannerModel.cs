using LiftLog.Lib;

namespace LiftLog.Ui.Models;

public record AiSessionCreatorModel(
    ImmutableListValue<string> AreasToWorkout,
    int Volume,
    string AdditionalInfo
);
