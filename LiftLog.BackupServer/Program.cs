using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

const string ApiKeyHeaderName = "X-API-Key";
const string ApiKeyName = "ApiKey";

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors();

app.UseHttpsRedirection();

app.MapPost(
    "/backup",
    async (
        Stream body,
        [FromHeader(Name = ApiKeyHeaderName)] string? apiKey,
        [FromQuery] string? user,
        IConfiguration configuration
    ) =>
    {
        if (configuration.GetValue<string>(ApiKeyName) != apiKey)
            return Results.Unauthorized();

        var backupDirectory = configuration.GetValue<string>("BackupDirectory");

        Directory.CreateDirectory(backupDirectory ?? "./");
        Directory.CreateDirectory(Path.Combine(backupDirectory ?? "./", user ?? ""));

        using var file = File.OpenWrite(
            Path.Combine(
                backupDirectory ?? "./",
                user ?? "",
                $"{DateTimeOffset.UtcNow:O}.liftlogbackup.gz"
            )
        );

        await body.CopyToAsync(file);

        return Results.Ok();
    }
);

app.Run();
