using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Text.Json;
using LiftLog.Api.Service;
using LiftLog.Lib.Models;
using LiftLog.Lib.Serialization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace LiftLog.Api.Authentication;

public class PurchaseTokenAuthenticationHandler
    : AuthenticationHandler<PurchaseTokenAuthenticationSchemeOptions>
{
    private readonly PurchaseVerificationService _purchaseVerificationService;
    private readonly ILogger<PurchaseTokenAuthenticationHandler> _logger;

    public PurchaseTokenAuthenticationHandler(
        IOptionsMonitor<PurchaseTokenAuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        PurchaseVerificationService purchaseVerificationService
    )
        : base(options, logger, encoder)
    {
        _purchaseVerificationService = purchaseVerificationService;
        _logger = logger.CreateLogger<PurchaseTokenAuthenticationHandler>();
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // Check for Authorization header
        if (!Request.Headers.ContainsKey("Authorization"))
        {
            _logger.LogWarning("Missing Authorization header");
            return AuthenticateResult.Fail("Missing Authorization header");
        }

        var authHeader = Request.Headers.Authorization.FirstOrDefault();
        if (string.IsNullOrEmpty(authHeader))
        {
            _logger.LogWarning("Empty Authorization header");
            return AuthenticateResult.Fail("Empty Authorization header");
        }

        // Parse the authorization header
        var authParts = authHeader.Split(' ');
        if (authParts.Length != 2)
        {
            _logger.LogWarning("Invalid Authorization header format");
            return AuthenticateResult.Fail("Invalid Authorization header format");
        }

        AppStore appStore;
        try
        {
            appStore = JsonSerializer.Deserialize<AppStore>(
                $"\"{authParts[0]}\"",
                JsonSerializerSettings.LiftLog
            );
        }
        catch (JsonException)
        {
            _logger.LogWarning("Invalid AppStore in Authorization header");
            return AuthenticateResult.Fail("Invalid AppStore in Authorization header");
        }

        var proToken = authParts[1];

        // Verify the purchase token
        if (!await _purchaseVerificationService.IsValidPurchaseToken(appStore, proToken))
        {
            _logger.LogWarning("Invalid purchase token");
            return AuthenticateResult.Fail("Invalid purchase token");
        }

        // Create claims for the authenticated user
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, proToken),
            new Claim("AppStore", appStore.ToString()),
            new Claim("ProToken", proToken),
        };

        var identity = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        return AuthenticateResult.Success(ticket);
    }
}

public class PurchaseTokenAuthenticationSchemeOptions : AuthenticationSchemeOptions
{
    public const string SchemeName = "PurchaseToken";
}
