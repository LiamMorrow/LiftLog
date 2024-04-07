using FluentValidation;
using LiftLog.Api.Db;
using LiftLog.Lib.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LiftLog.Api.Controllers;

[ApiController]
public class UsersController(UserDataContext db) : ControllerBase
{
    [HttpPost]
    [Route("[controller]")]
    public async Task<IActionResult> GetUsers(
        GetUsersRequest request,
        [FromServices] IValidator<GetUsersRequest> validator
    )
    {
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var users = await db.Users.Where(x => request.Ids.Contains(x.Id)).ToArrayAsync();
        foreach (var user in users)
        {
            user.LastAccessed = DateTimeOffset.UtcNow;
        }

        await db.SaveChangesAsync();
        return Ok(
            new GetUsersResponse(
                users.ToDictionary(
                    x => x.Id,
                    x => new GetUserResponse(
                        EncryptedCurrentPlan: x.EncryptedCurrentPlan,
                        EncryptedProfilePicture: x.EncryptedProfilePicture,
                        EncryptedName: x.EncryptedName,
                        EncryptionIV: x.EncryptionIV,
                        RsaPublicKey: x.RsaPublicKey
                    )
                )
            )
        );
    }
}
