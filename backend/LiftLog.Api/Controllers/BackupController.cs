using System.ComponentModel.DataAnnotations;
using LiftLog.Api.Authentication;
using LiftLog.Api.Features;
using LiftLog.Api.Service.Backup;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LiftLog.Api.Controllers;

[ApiController]
[Route("[controller]")]
[FeatureCheck(Feature.Backup)]
public class BackupController(ILogger<BackupController> logger, IBackupSink? backupSink = null)
    : ControllerBase
{
    /// <summary>
    /// The app checks a backup target by posting an empty body with this header. Answer it, but do
    /// not store it - see docs/RemoteBackup.md.
    /// </summary>
    private const string ProbeHeaderName = "X-LiftLog-Probe";

    [Authorize(AuthenticationSchemes = AuthSchemes.Backup)]
    [HttpPost]
    public async Task<IResult> Post()
    {
        var user = User.Identity?.Name;
        if (string.IsNullOrWhiteSpace(user))
        {
            return Results.Unauthorized();
        }
        if (backupSink is null)
        {
            logger.LogWarning("Backup attempted, however no backup sink registered");
            return Results.UnprocessableEntity();
        }

        if (Request.Headers.ContainsKey(ProbeHeaderName))
        {
            return Results.Ok();
        }

        await backupSink.UploadBackupAsync(user, Request.Body);

        return Results.Ok();
    }
}
