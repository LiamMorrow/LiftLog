using FluentValidation;
using LiftLog.Api.Db;
using LiftLog.Api.Models;
using LiftLog.Api.Service;
using LiftLog.Lib.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LiftLog.Api.Controllers;

[ApiController]
public class InboxController(UserDataContext db) : ControllerBase
{
    [HttpPut]
    [Route("[controller]")]
    public async Task<IActionResult> PutInboxItem(
        PutInboxMessageRequest request,
        [FromServices] IValidator<PutInboxMessageRequest> validator
    )
    {
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var user = await db.Users.FindAsync(request.ToUserId);
        if (user == null)
        {
            return NotFound();
        }

        var userInboxItem = new UserInboxItem
        {
            Id = Guid.NewGuid(),
            UserId = request.ToUserId,
            EncryptedMessage = request.EncryptedMessage,
        };
        db.UserInboxItems.Add(userInboxItem);
        await db.SaveChangesAsync();

        return Ok();
    }

    [HttpPost]
    [Route("[controller]")]
    public async Task<IActionResult> GetInboxItems(
        GetInboxMessagesRequest request,
        [FromServices] PasswordService passwordService,
        [FromServices] IValidator<GetInboxMessagesRequest> validator
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

        var inboxItems = await db
            .UserInboxItems.Where(x => x.UserId == request.UserId)
            .ToArrayAsync();
        db.UserInboxItems.RemoveRange(inboxItems);
        await db.SaveChangesAsync();
        return Ok(
            new GetInboxMessagesResponse(
                inboxItems
                    .Select(x => new GetInboxMessageResponse(
                        Id: x.Id,
                        EncryptedMessage: x.EncryptedMessage
                    ))
                    .ToArray()
            )
        );
    }
}
