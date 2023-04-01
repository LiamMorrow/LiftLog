namespace LiftLog.WebUi.Shared.SessionComponent.WeightedExercise.WeightDisplay;

public partial class WeightDisplay
{
    private bool PopupActive { get; set; }

    private decimal EditorWeight { get; set; }

    public void OnOpenClick()
    {
        EditorWeight = Exercise.Kilograms;
        PopupActive = true;
    }

    public void OnCloseClick()
    {
        PopupActive = false;
    }

    public void OnSaveClick()
    {
        UpdateWeightForExercise(EditorWeight);
        PopupActive = false;
    }

    public void OnWeightIncrementClick()
    {
        EditorWeight += Exercise.Blueprint.KilogramsIncreaseOnSuccess;
    }

    public void OnWeightDecrementClick()
    {
        EditorWeight -= Exercise.Blueprint.KilogramsIncreaseOnSuccess;
    }
}
