using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LiftLog.Lib.Models;

namespace LiftLog.Lib.Store
{
    public interface IProgressStore
    {
        ValueTask ClearCurrentSessionAsync();
        ValueTask<Session?> GetCurrentSessionAsync();
        IAsyncEnumerable<Session> GetOrderedSessions();
        ValueTask SaveCompletedSessionAsync(Session session);
        ValueTask SaveCurrentSessionAsync(Session session);
    }
}
