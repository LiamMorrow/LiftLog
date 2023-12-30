using System.Security.Cryptography;
using System.Text;
using FluentValidation;
using FluentValidation.TestHelper;
using LiftLog.Backend.Db;
using LiftLog.Backend.Functions.Validators;
using LiftLog.Backend.Models;
using LiftLog.Backend.Service;
using LiftLog.Lib.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddValidatorsFromAssemblyContaining<CreateUserRequestValidator>();

// Add services to the container.

builder.Services.AddDbContext<UserDataContext>(
    options => options.UseNpgsql(builder.Configuration.GetConnectionString("UserDataContext"))
);
var app = builder.Build();

app.UseHttpsRedirection();

app.MapGet(
    "/health",
    () =>
    {
        return "healthy";
    }
);

app.MapPost(
    "/user/create",
    async (
        UserDataContext db,
        CreateUserRequest request,
        IValidator<CreateUserRequest> validator
    ) =>
    {
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return Results.BadRequest(validationResult.Errors);
        }
        if (await db.Users.AnyAsync(x => x.Id == request.Id))
        {
            return Results.BadRequest(new string[] { "User already exists" });
        }
        var password = Guid.NewGuid().ToString();
        var hashedPassword = PasswordService.HashPassword(password, out var salt);
        var user = new User
        {
            Id = request.Id,
            HashedPassword = hashedPassword,
            Salt = salt,
            LastAccessed = DateTimeOffset.UtcNow,
        };

        await db.Users.AddAsync(user);
        await db.SaveChangesAsync();
        return Results.Ok(new CreateUserResponse(password));
    }
);

app.MapGet(
    "/user/{id}",
    async (UserDataContext db, Guid id) =>
    {
        var user = await db.Users.FindAsync(id);
        if (user == null)
        {
            return Results.NotFound();
        }
        user.LastAccessed = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();
        return Results.Ok(
            new GetUserResponse(
                EncryptedCurrentPlan: user.EncryptedCurrentPlan,
                EncryptedProfilePicture: user.EncryptedProfilePicture,
                EncryptedName: user.EncryptedName,
                EncryptionIV: user.EncryptionIV
            )
        );
    }
);

app.MapPut(
    "/user",
    async (
        UserDataContext db,
        PutUserDataRequest request,
        IValidator<PutUserDataRequest> validator
    ) =>
    {
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return Results.BadRequest(validationResult.Errors);
        }
        var user = await db.Users.FindAsync(request.Id);
        if (user == null)
        {
            return Results.NotFound();
        }
        if (!PasswordService.VerifyPassword(request.Password, user.HashedPassword, user.Salt))
        {
            return Results.Unauthorized();
        }
        user.EncryptedCurrentPlan = request.EncryptedCurrentPlan;
        user.EncryptedProfilePicture = request.EncryptedProfilePicture;
        user.EncryptedName = request.EncryptedName;
        user.EncryptionIV = request.EncryptionIV;
        await db.SaveChangesAsync();
        return Results.Ok();
    }
);

app.MapPut(
    "/event",
    async (
        UserDataContext db,
        PutUserEventRequest request,
        IValidator<PutUserEventRequest> validator
    ) =>
    {
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return Results.BadRequest(validationResult.Errors);
        }
        var user = await db.Users.FindAsync(request.UserId);
        if (user == null)
        {
            return Results.NotFound();
        }
        if (!PasswordService.VerifyPassword(request.Password, user.HashedPassword, user.Salt))
        {
            return Results.Unauthorized();
        }
        var userEvent = new UserEvent
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            Timestamp = DateTimeOffset.UtcNow,
            LastAccessed = DateTimeOffset.UtcNow,
            Expiry = request.Expiry,
            EncryptedEvent = request.EncryptedEventPayload,
            EncryptionIV = request.EncryptedEventIV,
        };
        user.LastAccessed = DateTimeOffset.UtcNow;
        await db.UserEvents.AddAsync(userEvent);
        await db.SaveChangesAsync();
        return Results.Ok();
    }
);

app.MapPost(
    "/events",
    async (UserDataContext db, GetEventsRequest request, IValidator<GetEventsRequest> validator) =>
    {
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return Results.BadRequest(validationResult.Errors);
        }
        var events = await db.UserEvents.Where(x => request.UserIds.Contains(x.UserId))
            .Where(x => x.Timestamp >= request.Since)
            .Where(x => x.Expiry > DateTimeOffset.UtcNow)
            .Where(x => x.LastAccessed >= DateTimeOffset.UtcNow - TimeSpan.FromDays(7))
            .ToArrayAsync();
        var userEvents = events
            .Select(
                x =>
                    new UserEventResponse(
                        UserId: x.UserId,
                        EventId: x.Id,
                        Timestamp: x.Timestamp,
                        EncryptedEventPayload: x.EncryptedEvent,
                        EncryptedEventIV: x.EncryptionIV,
                        Expiry: x.Expiry
                    )
            )
            .ToArray();
        foreach (var userEvent in events)
        {
            userEvent.LastAccessed = DateTimeOffset.UtcNow;
        }
        await db.SaveChangesAsync();
        return Results.Ok(new GetEventsResponse(userEvents));
    }
);

app.Run();
