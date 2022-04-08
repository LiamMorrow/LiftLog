using Microsoft.AspNetCore.Components;

namespace SimpleGymTracker.WebUi.Shared.Session.WeightedExercise.WeightDisplay
{
  public partial class WeightDisplay
  {

    private bool PopupActive { get; set; }

    public void OnOpenClick()
    {
      PopupActive = true;
    }
  }
}
