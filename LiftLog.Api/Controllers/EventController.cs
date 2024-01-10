using FluentValidation;
using LiftLog.Api.Db;
using LiftLog.Api.Models;
using LiftLog.Api.Service;
using LiftLog.Lib.Models;
using Microsoft.AspNetCore.Mvc;

namespace LiftLog.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class EventController(UserDataContext db, PasswordService passwordService) : ControllerBase
{
    [Route("/")]
    [HttpPut]
    public async Task<IActionResult> PutEvent(
        PutUserEventRequest request,
        [FromServices] IValidator<PutUserEventRequest> validator
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
        var userEvent = new UserEvent
        {
            Id = request.EventId,
            UserId = request.UserId,
            Timestamp = DateTimeOffset.UtcNow,
            LastAccessed = DateTimeOffset.UtcNow,
            Expiry = request.Expiry,
            EncryptedEvent = request.EncryptedEventPayload,
            EncryptionIV = request.EncryptedEventIV,
        };
        user.LastAccessed = DateTimeOffset.UtcNow;

        var existingEvent = await db.UserEvents.FindAsync(request.UserId, request.EventId);
        if (existingEvent != null)
        {
            db.UserEvents.Remove(existingEvent);
        }
        db.UserEvents.Add(userEvent);

        await db.SaveChangesAsync();
        return Ok();
    }
}
