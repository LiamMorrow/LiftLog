using System.Text.Json;
using Plugin.LocalNotification.Json;

namespace LiftLog.App.Services;

public class NotificationSerializer : INotificationSerializer
{
    public virtual TValue Deserialize<TValue>(string json)
    {
        return JsonSerializer.Deserialize<TValue>(json)!;
    }

    public virtual string Serialize<TValue>(TValue value)
    {
        return JsonSerializer.Serialize(value);
    }
}
