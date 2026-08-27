namespace LiftLog.Api.Features;

public interface IFeatureGate
{
    bool IsEnabled(Feature feature);
}

/// <summary>
/// Features are opt-out.
/// Self-hosters turn one off with <c>{Section}:Enabled = false</c>.
/// </summary>
public class FeatureGate(IConfiguration configuration) : IFeatureGate
{
    public bool IsEnabled(Feature feature) =>
        configuration.GetValue<bool?>(feature.EnabledPath()) ?? true;
}

public static class FeatureRegistrationHelpers
{
    public static IServiceCollection AddFeatureGating(this IServiceCollection source)
    {
        source.AddSingleton<IFeatureGate, FeatureGate>();
        return source;
    }
}
