using System.ComponentModel.DataAnnotations;

namespace LiftLog.Api.Models;

public class SharedItem
{
    public string Id { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTimeOffset Timestamp { get; set; }

    // A user supplied expiry time for this event, this does not ensure that the event will last this long, just that it will definitely be deleted after this time
    // We may delete the event before this time if it is not accessed for a long time
    public DateTimeOffset Expiry { get; set; }

    // This payload is encrypted with a AES key generated for this event.  It is not stored, it only exists in the share url
    // The inner payload is signed with the user's private key
    // Its schema is defined in LiftLog.Ui/Models/SharedItem.proto - we don't reference this proto since the server doesn't need to deserialize it
    [MaxLength(5 * 1024)]
    public byte[] EncryptedPayload { get; set; } = null!;

    // The IV can be considered public, as long as the encryption key is kept secret
    public byte[] EncryptionIV { get; set; } = null!;
}
