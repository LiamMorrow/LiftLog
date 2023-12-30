namespace LiftLog.Backend.Models;

public class User
{
    public Guid Id { get; set; }

    // Hashed and salted password used for authentication
    public string HashedPassword { get; set; } = null!;

    public byte[] EncryptedCurrentPlan { get; set; } = null!;

    public byte[] EncryptedProfilePicture { get; set; } = null!;

    public byte[] EncryptedName { get; set; } = null!;
}
