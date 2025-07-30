namespace LiftLog.Api.Models
{
    public class UserEventFilter
    {
        public Guid UserId { get; set; }
        public DateTimeOffset Since { get; set; }
    }
}
