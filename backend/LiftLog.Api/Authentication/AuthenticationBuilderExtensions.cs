using LiftLog.Api.Service;
using Microsoft.AspNetCore.Authentication;

namespace LiftLog.Api.Authentication;

public static class AuthenticationBuilderExtensions
{
    public static AuthenticationBuilder AddPurchaseToken(this AuthenticationBuilder builder)
    {
        builder.Services.AddScoped<PurchaseVerificationService>();
        builder.Services.AddRevenueCatPurchaseVerification();
        return builder.AddScheme<
            PurchaseTokenAuthenticationSchemeOptions,
            PurchaseTokenAuthenticationHandler
        >(PurchaseTokenAuthenticationSchemeOptions.SchemeName, configureOptions: null);
    }

    public static AuthenticationBuilder AddApiKey(this AuthenticationBuilder builder)
    {
        builder
            .Services.AddOptions<ApiKeyAuthenticationSchemeOptions>(
                ApiKeyAuthenticationSchemeOptions.SchemeName
            )
            .BindConfiguration(AuthConfiguration.ApiKey.SectionName)
            .ValidateOnStart();

        return builder.AddScheme<ApiKeyAuthenticationSchemeOptions, ApiKeyAuthenticationHandler>(
            ApiKeyAuthenticationSchemeOptions.SchemeName,
            configureOptions: null
        );
    }

    public static AuthenticationBuilder AddForwardAuth(this AuthenticationBuilder builder)
    {
        builder
            .Services.AddOptions<ForwardAuthAuthenticationSchemeOptions>(
                ForwardAuthAuthenticationSchemeOptions.SchemeName
            )
            .BindConfiguration(AuthConfiguration.ForwardAuth.SectionName)
            .PostConfigure(options => options.ParseTrustedProxies())
            .ValidateOnStart();

        return builder.AddScheme<
            ForwardAuthAuthenticationSchemeOptions,
            ForwardAuthAuthenticationHandler
        >(ForwardAuthAuthenticationSchemeOptions.SchemeName, configureOptions: null);
    }
}
