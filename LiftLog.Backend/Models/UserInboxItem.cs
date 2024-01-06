namespace LiftLog.Backend.Models;

public class UserInboxItem
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    // These messages are encrypted with the user's public key, which they store on their client
    public byte[] EncryptedMessage { get; set; } = null!;
}
