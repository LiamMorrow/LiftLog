using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace LiftLog.Api.Models;

[Index(nameof(UserLookup), IsUnique = true)]
public class User
{
    public Guid Id { get; set; }

    public int UserLookup { get; set; }

    // Hashed and salted password used for authentication
    public string HashedPassword { get; set; } = null!;

    public DateTimeOffset LastAccessed { get; set; }

    public byte[] Salt { get; set; } = null!;

    public byte[]? EncryptedCurrentPlan { get; set; }

    public byte[]? EncryptedProfilePicture { get; set; }

    public byte[]? EncryptedName { get; set; }

    // The IV can be considered public, as long as the encryption key is kept secret
    public byte[] EncryptionIV { get; set; } = null!;

    public byte[] RsaPublicKey { get; set; } = null!;
}
