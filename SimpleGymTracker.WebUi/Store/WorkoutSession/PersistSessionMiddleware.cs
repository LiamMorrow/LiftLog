using System;
using System.Threading.Tasks;
using Fluxor;
using Newtonsoft.Json;
using SimpleGymTracker.Lib.Store;

namespace SimpleGymTracker.WebUi.Store.WorkoutSession
{
  public class PersistSessionMiddleware : Middleware
  {
    private readonly IProgressStore _progressStore;
    private IStore? _store;

    public PersistSessionMiddleware(IProgressStore progressStore)
    {
      _progressStore = progressStore;
    }

    public override async Task InitializeAsync(IStore store)
    {
      this._store = store;
      var currentDay = await _progressStore.GetCurrentDayAsync();
      if (currentDay?.Day is not null)
      {
        store.Features["WorkoutSession"].RestoreState(new WorkoutSessionState(currentDay));
      }
      store.Dispatch(new RehydrateSessionAction());
    }

    public override void AfterDispatch(object action)
    {
      var currentState = (WorkoutSessionState?)_store?.Features["WorkoutSession"].GetState();
      if (currentState?.DayDao is not null)
      {
        _progressStore.SaveCurrentDayAsync(currentState.DayDao);
      }
    }
  }
}
