namespace LiftLog.Backend.Models;

// This secret is what is used when requesting a user's events.
// Each "follower" gets its own secret which can be revoked by the followed user at any time.
public class UserFollowSecret
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public string Value { get; set; } = null!;
}
