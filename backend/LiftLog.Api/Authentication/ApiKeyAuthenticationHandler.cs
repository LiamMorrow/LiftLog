using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Text.Json;
using LiftLog.Api.Service;
using LiftLog.Lib.Models;
using LiftLog.Lib.Serialization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace LiftLog.Api.Authentication;

public class ApiKeyAuthenticationHandler(
    IOptionsMonitor<ApiKeyAuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder
) : AuthenticationHandler<ApiKeyAuthenticationSchemeOptions>(options, logger, encoder)
{
    private readonly ILogger<ApiKeyAuthenticationHandler> _logger =
        logger.CreateLogger<ApiKeyAuthenticationHandler>();

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (string.IsNullOrWhiteSpace(Options.ApiKey))
        {
            return AuthenticateResult.NoResult();
        }
        // Check for Authorization header
        if (
            !Request.Headers.TryGetValue(
                "X-API-Key",
                out Microsoft.Extensions.Primitives.StringValues value
            )
        )
        {
            return AuthenticateResult.Fail("Missing X-API-Key header");
        }

        var authHeader = value.First();
        if (string.IsNullOrEmpty(authHeader))
        {
            _logger.LogWarning("Empty X-API-Key header");
            return AuthenticateResult.Fail("Empty X-API-Key header");
        }

        if (authHeader != Options.ApiKey)
        {
            return AuthenticateResult.Fail("X-API-Key incorrect");
        }

        // Create claims for the authenticated user
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, "default") };

        var identity = new ClaimsIdentity(
            claims,
            Scheme.Name,
            ClaimTypes.NameIdentifier,
            ClaimTypes.Role
        );
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        return AuthenticateResult.Success(ticket);
    }
}

public class ApiKeyAuthenticationSchemeOptions : AuthenticationSchemeOptions
{
    public const string SchemeName = "ApiKey";

    /// <summary>
    /// Shared secret callers present as X-API-Key. Unset leaves the scheme inert.
    /// </summary>
    [ConfigurationKeyName("Value")]
    public string? ApiKey { get; set; }
}
