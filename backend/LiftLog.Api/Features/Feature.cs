using LiftLog.Api.Service;
using LiftLog.Api.Service.Backup;

namespace LiftLog.Api.Features;

public enum Feature
{
    Feed,
    Backup,
    Sharing,
    AiPlanner,
}

public static class FeatureConfiguration
{
    public const string EnabledKey = "Enabled";

    public static string SectionName(this Feature feature) =>
        feature switch
        {
            Feature.Feed => "Feed",
            Feature.Backup => BackupConfiguration.SectionName,
            Feature.Sharing => "Sharing",
            Feature.AiPlanner => AiPlannerConfiguration.SectionName,
        };

    public static string EnabledPath(this Feature feature) =>
        $"{feature.SectionName()}:{EnabledKey}";
}
