using System.Collections.Immutable;
using FluentValidation;
using LiftLog.Backend.Db;
using LiftLog.Backend.Functions.Validators;
using LiftLog.Backend.Models;
using LiftLog.Backend.Service;
using LiftLog.Lib.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddValidatorsFromAssemblyContaining<CreateUserRequestValidator>();

// Add services to the container.

builder.Services.AddDbContext<UserDataContext>(
    options => options.UseNpgsql(builder.Configuration.GetConnectionString("UserDataContext"))
);
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("*").AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors();

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
            EncryptionIV = [],
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

app.MapPost(
    "/user/delete",
    async (
        UserDataContext db,
        DeleteUserRequest request,
        IValidator<DeleteUserRequest> validator
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
        db.Users.Remove(user);
        await db.SaveChangesAsync();
        return Results.Ok();
    }
);

app.MapPost(
    "/users",
    async (UserDataContext db, GetUsersRequest request, IValidator<GetUsersRequest> validator) =>
    {
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return Results.BadRequest(validationResult.Errors);
        }
        var users = await db.Users.Where(x => request.Ids.Contains(x.Id)).ToArrayAsync();
        foreach (var user in users)
        {
            user.LastAccessed = DateTimeOffset.UtcNow;
        }
        await db.SaveChangesAsync();
        return Results.Ok(
            new GetUsersResponse(
                users.ToDictionary(
                    x => x.Id,
                    x =>
                        new GetUserResponse(
                            EncryptedCurrentPlan: x.EncryptedCurrentPlan,
                            EncryptedProfilePicture: x.EncryptedProfilePicture,
                            EncryptedName: x.EncryptedName,
                            EncryptionIV: x.EncryptionIV
                        )
                )
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
        var validFollowSecrets = await db.UserFollowSecrets.Where(
            x => request.Users.Select(x => x.FollowSecret).Contains(x.Value)
        )
            .ToArrayAsync();
        var invalidFollowSecrets = request
            .Users.Select(x => x.FollowSecret)
            .Except(validFollowSecrets.Select(x => x.Value))
            .ToArray();
        var userIds = validFollowSecrets.Select(x => x.UserId).ToArray();
        var events = await db.UserEvents.Where(x => userIds.Contains(x.UserId))
            .Where(x => x.Timestamp > request.Since)
            .Where(x => x.Expiry > DateTimeOffset.UtcNow)
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
        return Results.Ok(new GetEventsResponse(userEvents, invalidFollowSecrets));
    }
);

app.MapPut(
    "/inbox",
    async (
        UserDataContext db,
        PutInboxMessageRequest request,
        IValidator<PutInboxMessageRequest> validator
    ) =>
    {
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return Results.BadRequest(validationResult.Errors);
        }
        var user = await db.Users.FindAsync(request.ToUserId);
        if (user == null)
        {
            return Results.NotFound();
        }

        var userInboxItem = new UserInboxItem
        {
            Id = Guid.NewGuid(),
            UserId = request.ToUserId,
            EncryptedMessage = request.EncryptedMessage,
        };
        db.UserInboxItems.Add(userInboxItem);
        await db.SaveChangesAsync();

        return Results.Ok();
    }
);

app.MapPost(
    "/inbox",
    async (
        UserDataContext db,
        GetInboxMessagesRequest request,
        IValidator<GetInboxMessagesRequest> validator
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
        var inboxItems = await db.UserInboxItems.Where(x => x.UserId == request.UserId)
            .ToArrayAsync();
        db.UserInboxItems.RemoveRange(inboxItems);
        await db.SaveChangesAsync();
        return Results.Ok(
            new GetInboxMessagesResponse(
                inboxItems
                    .Select(
                        x =>
                            new GetInboxMessageResponse(
                                Id: x.Id,
                                EncryptedMessage: x.EncryptedMessage
                            )
                    )
                    .ToArray()
            )
        );
    }
);

app.MapPut(
    "/follow-secret",
    async (
        UserDataContext db,
        PutUserFollowSecretRequest request,
        IValidator<PutUserFollowSecretRequest> validator
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
        var userFollowSecret = new UserFollowSecret
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            Value = request.FollowSecret,
        };
        await db.UserFollowSecrets.AddAsync(userFollowSecret);
        await db.SaveChangesAsync();
        return Results.Ok();
    }
);

app.MapPost(
    "/follow-secret/delete",
    async (
        UserDataContext db,
        DeleteUserFollowSecretRequest request,
        IValidator<DeleteUserFollowSecretRequest> validator
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
        var userFollowSecret = await db.UserFollowSecrets.Where(
            x => x.UserId == request.UserId && x.Value == request.FollowSecret
        )
            .ToListAsync();
        db.UserFollowSecrets.RemoveRange(userFollowSecret);
        await db.SaveChangesAsync();
        return Results.Ok();
    }
);

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<UserDataContext>();
    await db.Database.MigrateAsync();
}

app.Run();
