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
public class BackupController(IBackupSink? backupSink = null) : ControllerBase
{
    [Authorize(AuthenticationSchemes = AuthSchemes.Backup)]
    [HttpPost]
    public async Task<IResult> Post()
    {
        if (backupSink is null)
        {
            return Results.UnprocessableEntity();
        }
        var user = User.Identity?.Name;
        if (string.IsNullOrWhiteSpace(user))
        {
            return Results.Unauthorized();
        }

        await backupSink.UploadBackupAsync(user, Request.Body);

        return Results.Ok();
    }
}
