using LiftLog.Api.Service.Backup;

namespace LiftLog.Tests.Api.Unit;

public class S3BackupSinkTests
{
    private const string FileSuffix = ".liftlogbackup.gz";

    [Test]
    [Arguments("..")]
    [Arguments(".")]
    [Arguments("../evil")]
    [Arguments("../../etc/passwd")]
    [Arguments("default/../../evil")]
    [Arguments("..\\evil")]
    [Arguments("nested/name")]
    [Arguments("nested\\name")]
    [Arguments("/etc/passwd")]
    [Arguments("/absolute")]
    [Arguments("C:\\Windows\\Temp")]
    [Arguments(".hidden")]
    [Arguments("trailing.")]
    [Arguments("trailing ")]
    [Arguments(" leading")]
    [Arguments("")]
    [Arguments("   ")]
    [Arguments("name\0byte")]
    [Arguments("na*me")]
    [Arguments("na:me")]
    [Arguments("na%2Fme")]
    [Arguments("na?me")]
    [Arguments("na#me")]
    [Arguments("na+me")]
    public async Task ResolveObjectKey_RejectsUnsafeName(string backupName)
    {
        await Assert
            .That(() => S3BackupSink.ResolveObjectKey("backups", backupName))
            .Throws<ArgumentException>();
    }

    [Test]
    [Arguments("default")]
    [Arguments("a")]
    [Arguments("user-1")]
    [Arguments("user_1")]
    [Arguments("user.name")]
    [Arguments("A1")]
    public async Task ResolveObjectKey_WithoutPrefix_IsBackupNameThenFile(string backupName)
    {
        var key = S3BackupSink.ResolveObjectKey(null, backupName);

        await Assert.That(key).StartsWith($"{backupName}/");
        await Assert.That(key).EndsWith(FileSuffix);
        await Assert.That(key.Split('/').Length).IsEqualTo(2);
    }

    [Test]
    [Arguments("prod")]
    [Arguments("/prod")]
    [Arguments("prod/")]
    [Arguments("//prod//")]
    [Arguments("  prod  ")]
    public async Task ResolveObjectKey_NormalisesPrefix(string configuredPrefix)
    {
        var key = S3BackupSink.ResolveObjectKey(configuredPrefix, "default");

        await Assert.That(key).StartsWith("prod/default/");
        await Assert.That(key).EndsWith(FileSuffix);
    }

    [Test]
    [Arguments(null)]
    [Arguments("")]
    [Arguments("   ")]
    [Arguments("/")]
    [Arguments("///")]
    public async Task ResolveObjectKey_WithBlankPrefix_OmitsPrefixSegment(string? configuredPrefix)
    {
        var key = S3BackupSink.ResolveObjectKey(configuredPrefix, "default");

        await Assert.That(key).StartsWith("default/");
    }

    [Test]
    public async Task ResolveObjectKey_KeepsNestedPrefix()
    {
        var key = S3BackupSink.ResolveObjectKey("prod/nightly", "default");

        await Assert.That(key).StartsWith("prod/nightly/default/");
    }

    [Test]
    [Arguments(null)]
    [Arguments("prod")]
    [Arguments("/prod/")]
    [Arguments("prod/nightly")]
    public async Task ResolveObjectKey_IsAWellFormedKey(string? configuredPrefix)
    {
        var key = S3BackupSink.ResolveObjectKey(configuredPrefix, "default");

        await Assert.That(key).DoesNotStartWith("/");
        await Assert.That(key).DoesNotContain("//");
        await Assert.That(key).DoesNotContain("\\");
    }

    [Test]
    public async Task ResolveObjectKey_NamesFileWithRoundTrippableUtcTimestamp()
    {
        var before = DateTimeOffset.UtcNow.AddSeconds(-5);

        var key = S3BackupSink.ResolveObjectKey("prod", "default");

        var fileName = key.Split('/')[^1];
        var timestamp = fileName[..^FileSuffix.Length];
        var parsed = DateTimeOffset.ParseExact(
            timestamp,
            "O",
            System.Globalization.CultureInfo.InvariantCulture
        );

        await Assert.That(parsed.Offset).IsEqualTo(TimeSpan.Zero);
        await Assert.That(parsed).IsGreaterThanOrEqualTo(before);
        await Assert.That(parsed).IsLessThanOrEqualTo(DateTimeOffset.UtcNow.AddSeconds(5));
    }
}
