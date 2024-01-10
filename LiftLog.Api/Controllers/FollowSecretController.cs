using FluentValidation;
using LiftLog.Api.Db;
using LiftLog.Api.Models;
using LiftLog.Api.Service;
using LiftLog.Lib.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LiftLog.Api.Controllers;

[ApiController]
[Route("follow-secret")]
public class FollowSecretController(UserDataContext db, PasswordService passwordService)
    : ControllerBase
{
    [HttpPut]
    [Route("/")]
    public async Task<IActionResult> PutFollowSecret(
        PutUserFollowSecretRequest request,
        [FromServices] IValidator<PutUserFollowSecretRequest> validator
    )
    {
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }
        var user = await db.Users.FindAsync(request.UserId);
        if (user == null)
        {
            return NotFound();
        }
        if (!passwordService.VerifyPassword(request.Password, user.HashedPassword, user.Salt))
        {
            return Unauthorized();
        }
        var userFollowSecret = new UserFollowSecret
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            Value = request.FollowSecret,
        };
        await db.UserFollowSecrets.AddAsync(userFollowSecret);
        await db.SaveChangesAsync();
        return Ok();
    }

    [HttpPost]
    [Route("/delete")]
    public async Task<IActionResult> DeleteFollowSecret(
        DeleteUserFollowSecretRequest request,
        [FromServices] IValidator<DeleteUserFollowSecretRequest> validator
    )
    {
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }
        var user = await db.Users.FindAsync(request.UserId);
        if (user == null)
        {
            return NotFound();
        }
        if (!passwordService.VerifyPassword(request.Password, user.HashedPassword, user.Salt))
        {
            return Unauthorized();
        }
        var userFollowSecret = await db.UserFollowSecrets.Where(
            x => x.UserId == request.UserId && x.Value == request.FollowSecret
        )
            .ToListAsync();
        db.UserFollowSecrets.RemoveRange(userFollowSecret);
        await db.SaveChangesAsync();
        return Ok();
    }
}
