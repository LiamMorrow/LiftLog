using System.Net;
using System.Net.Sockets;
using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace LiftLog.Api.Authentication;

/// <summary>
/// Trusts an identity header set by a reverse proxy that has already authenticated the caller
/// (Authelia, Authentik, oauth2-proxy, Caddy forward_auth, Traefik ForwardAuth).
/// </summary>
public class ForwardAuthAuthenticationHandler(
    IOptionsMonitor<ForwardAuthAuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder
) : AuthenticationHandler<ForwardAuthAuthenticationSchemeOptions>(options, logger, encoder)
{
    private readonly ILogger<ForwardAuthAuthenticationHandler> _logger =
        logger.CreateLogger<ForwardAuthAuthenticationHandler>();

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (string.IsNullOrWhiteSpace(Options.UserHeader))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var peer = Context.Connection.RemoteIpAddress;
        if (!Options.IsTrustedProxy(peer))
        {
            _logger.LogWarning(
                "Ignoring {UserHeader} from untrusted peer {Peer}",
                Options.UserHeader,
                peer
            );
            return Task.FromResult(AuthenticateResult.Fail("Request is not from a trusted proxy"));
        }

        if (!Request.Headers.TryGetValue(Options.UserHeader, out var value))
        {
            return Task.FromResult(AuthenticateResult.Fail($"Missing {Options.UserHeader} header"));
        }

        var user = value.FirstOrDefault();
        if (string.IsNullOrWhiteSpace(user))
        {
            _logger.LogWarning("Empty {UserHeader} header", Options.UserHeader);
            return Task.FromResult(AuthenticateResult.Fail($"Empty {Options.UserHeader} header"));
        }

        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, user) };
        var identity = new ClaimsIdentity(
            claims,
            Scheme.Name,
            ClaimTypes.NameIdentifier,
            ClaimTypes.Role
        );
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}

public class ForwardAuthAuthenticationSchemeOptions : AuthenticationSchemeOptions
{
    public const string SchemeName = "ForwardAuth";

    /// <summary>
    /// Header the proxy puts the authenticated user in. Unset leaves the scheme inert.
    /// </summary>
    public string? UserHeader { get; set; }

    /// <summary>
    /// Comma separated CIDR ranges the identity header is accepted from. A bare address is treated
    /// as a single host, so "10.1.2.3" and "10.1.2.3/32" mean the same thing. Empty trusts any
    /// peer, which is only safe when nothing but the proxy can reach the server.
    /// </summary>
    public string? TrustedProxies { get; set; }

    private IReadOnlyList<IPNetwork> _trustedProxyNetworks = [];

    public bool IsTrustedProxy(IPAddress? peer)
    {
        if (_trustedProxyNetworks.Count == 0)
        {
            return true;
        }
        if (peer is null)
        {
            return false;
        }
        if (peer.IsIPv4MappedToIPv6)
        {
            peer = peer.MapToIPv4();
        }
        return _trustedProxyNetworks.Any(network => network.Contains(peer));
    }

    /// <summary>
    /// Turns the bound <see cref="TrustedProxies" /> string into networks. Runs as a
    /// PostConfigure step so a malformed range fails the host at startup rather than on the first
    /// request that happens to need it.
    /// </summary>
    public void ParseTrustedProxies()
    {
        if (string.IsNullOrWhiteSpace(TrustedProxies))
        {
            _trustedProxyNetworks = [];
            return;
        }

        _trustedProxyNetworks =
        [
            .. TrustedProxies
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(ParseNetwork),
        ];
    }

    private static IPNetwork ParseNetwork(string entry)
    {
        try
        {
            if (entry.Contains('/'))
            {
                return IPNetwork.Parse(entry);
            }

            var address = IPAddress.Parse(entry);
            return new IPNetwork(
                address,
                address.AddressFamily == AddressFamily.InterNetworkV6 ? 128 : 32
            );
        }
        catch (Exception e) when (e is FormatException or ArgumentException)
        {
            throw new InvalidOperationException(
                $"'{AuthConfiguration.ForwardAuth.TrustedProxiesPath}' contains an invalid network '{entry}'.",
                e
            );
        }
    }
}
