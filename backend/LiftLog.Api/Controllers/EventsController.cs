using FluentValidation;
using LiftLog.Api.Db;
using LiftLog.Api.Features;
using LiftLog.Api.Models;
using LiftLog.Lib.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LiftLog.Api.Controllers;

[ApiController]
[FeatureCheck(Feature.Feed)]
public class EventsController(UserDataContext db) : ControllerBase
{
    [HttpPost]
    [Route("[controller]")]
    public async Task<IActionResult> GetEvents(
        GetEventsRequest request,
        [FromServices] IValidator<GetEventsRequest> validator
    )
    {
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var validFollowSecrets = await db
            .UserFollowSecrets.Where(x =>
                request.Users.Select(x => x.FollowSecret).Contains(x.Value)
            )
            .ToArrayAsync();
        var invalidFollowSecrets = request
            .Users.Select(x => x.FollowSecret)
            .Except(validFollowSecrets.Select(x => x.Value))
            .ToArray();
        var userIdsAndSince = validFollowSecrets
            .Select(x => new UserEventFilter
            {
                UserId = x.UserId,
                Since = request.Users.Single(y => y.UserId == x.UserId).Since,
            })
            .ToArray();

        var now = DateTimeOffset.UtcNow;

        var events = await db
            .UserEvents.Join(
                db.CreateUserEventFilterResultSet(userIdsAndSince),
                x => x.UserId,
                x => x.UserId,
                (Event, Request) => new { Event, Request }
            )
            .Where(x => x.Event.Expiry > now)
            .Where(x => x.Event.Timestamp > x.Request.Since)
            .Select(x => x.Event)
            .ToArrayAsync();

        var userEvents = events
            .Select(x => new UserEventResponse(
                UserId: x.UserId,
                EventId: x.Id,
                Timestamp: x.Timestamp,
                EncryptedEventPayload: x.EncryptedEvent,
                EncryptedEventIV: x.EncryptionIV,
                Expiry: x.Expiry
            ))
            .ToArray();
        foreach (var userEvent in events)
        {
            userEvent.LastAccessed = now;
        }

        await db.SaveChangesAsync();
        return Ok(new GetEventsResponse(userEvents, invalidFollowSecrets));
    }
}
