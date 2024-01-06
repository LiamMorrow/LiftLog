using System.ComponentModel.DataAnnotations;

namespace LiftLog.Backend.Models;

public class UserEvent
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTimeOffset Timestamp { get; set; }

    // This is the last time anyone accessed this event
    // If this is too old, we can delete the event, even if it hasn't expired
    public DateTimeOffset LastAccessed { get; set; }

    // A user supplied expiry time for this event, this does not ensure that the event will last this long, just that it will definitely be deleted after this time
    // We may delete the event before this time if it is not accessed for a long time
    public DateTimeOffset Expiry { get; set; }

    // This payload is encrypted with the user's private key, which we do not store
    // Its schema is defined in LiftLog.Ui/Models/UserEvent.proto - we don't reference this proto since the server doesn't need to deserialize it
    [MaxLength(5 * 1024)]
    public byte[] EncryptedEvent { get; set; } = null!;

    // The IV can be considered public, as long as the encryption key is kept secret
    public byte[] EncryptionIV { get; set; } = null!;
}
