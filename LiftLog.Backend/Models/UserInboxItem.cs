namespace LiftLog.Backend.Models;

public class UserInboxItem
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    // These messages are encrypted with the user's public key, which they store on their client
    // Since RSA can only encrypt as large as the key (and the payload will  be an RSA public key)
    // We need to chunk the payload into smaller pieces
    public byte[][] EncryptedMessage { get; set; } = null!;
}
