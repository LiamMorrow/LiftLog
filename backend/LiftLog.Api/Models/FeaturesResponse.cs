namespace LiftLog.Api.Models;

/// <summary>
/// What this instance offers. The app reads this when a user adds a backend so it can tell them
/// which features that server can serve, instead of only finding out via a 423 mid-request.
/// </summary>
public record FeaturesResponse(bool Feed, bool Sharing, bool AiPlanner, bool Backup);
