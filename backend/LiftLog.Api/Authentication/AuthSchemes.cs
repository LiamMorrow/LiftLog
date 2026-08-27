namespace LiftLog.Api.Authentication;

/// <summary>
/// The set of authentication methods each endpoint accepts. A request is authorised as soon as any
/// one of them succeeds.
/// </summary>
public static class AuthSchemes
{
    public const string Backup =
        $"{ApiKeyAuthenticationSchemeOptions.SchemeName},"
        + ForwardAuthAuthenticationSchemeOptions.SchemeName;

    public const string AiPlanner =
        $"{PurchaseTokenAuthenticationSchemeOptions.SchemeName},"
        + $"{ApiKeyAuthenticationSchemeOptions.SchemeName},"
        + ForwardAuthAuthenticationSchemeOptions.SchemeName;
}
