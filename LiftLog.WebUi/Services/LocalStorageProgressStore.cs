using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Blazored.LocalStorage;
using LiftLog.Lib.Models;
using LiftLog.Lib.Store;

namespace LiftLog.WebUi.Services
{
    public class LocalStorageProgressStore : IProgressStore
    {
        private bool _initialised;
        private WorkoutDayDao? _currentDay;
        private readonly ConcurrentDictionary<Guid, WorkoutDay> _storedSessions = new();
        private readonly ILocalStorageService _localStorage;

        public LocalStorageProgressStore(ILocalStorageService localStorage)
        {
            _localStorage = localStorage;
        }

        public async IAsyncEnumerable<WorkoutDayDao> GetAllWorkoutDaysAsync()
        {
            await InitialiseAsync();
            foreach (
                var session in _storedSessions
                    .Select(day => new WorkoutDayDao(day.Key, day.Value))
                    .OrderByDescending(x => x.Day.Date)
            )
            {
                yield return session;
            }
        }

        public async ValueTask<WorkoutDayDao?> GetCurrentDayAsync()
        {
            await InitialiseAsync();
            return _currentDay;
        }

        public IAsyncEnumerable<WorkoutDayDao> GetWorkoutDaysForPlanAsync(WorkoutPlan plan) =>
            GetAllWorkoutDaysAsync().Where(x => x.Day.Plan == plan);

        public ValueTask SaveCompletedDayAsync(WorkoutDayDao dao)
        {
            _storedSessions[dao.Id] = dao.Day;
            return PersistAsync();
        }

        public ValueTask SaveCurrentDayAsync(WorkoutDayDao day)
        {
            _currentDay = day;
            return PersistAsync();
        }

        public ValueTask ClearCurrentDayAsync()
        {
            _currentDay = null;
            return PersistAsync();
        }

        public ValueTask<WorkoutDay?> GetWorkoutDayAsync(Guid id)
        {
            if (_storedSessions.TryGetValue(id, out var day))
            {
                return ValueTask.FromResult<WorkoutDay?>(day);
            }
            return ValueTask.FromResult<WorkoutDay?>(null);
        }

        private async ValueTask InitialiseAsync()
        {
            if (!_initialised)
            {
                // TODO fix race
                var storedData = await _localStorage.GetItemAsync<StorageDao?>("Progress");
                if (storedData is not null)
                {
                    foreach (var session in storedData.CompletedSessions)
                    {
                        _storedSessions[session.Id] = session.Day;
                    }
                    _currentDay = storedData.CurrentDay;
                }
                _initialised = true;
            }
        }

        private ValueTask PersistAsync()
        {
            return _localStorage.SetItemAsync(
                "Progress",
                new StorageDao(
                    _currentDay,
                    _storedSessions.Select(x => new WorkoutDayDao(x.Key, x.Value)).ToList()
                )
            );
        }

        private record StorageDao(WorkoutDayDao? CurrentDay, List<WorkoutDayDao> CompletedSessions);
    }
}
