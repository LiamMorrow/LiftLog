namespace LiftLog.Api.Authentication;

public static class AuthConfiguration
{
    public const string SectionName = "Auth";

    public static class ApiKey
    {
        public const string SectionName = $"{AuthConfiguration.SectionName}:ApiKey";
        public const string ValuePath = $"{SectionName}:Value";
    }

    public static class ForwardAuth
    {
        public const string SectionName = $"{AuthConfiguration.SectionName}:ForwardAuth";
        public const string UserHeaderPath = $"{SectionName}:UserHeader";
        public const string TrustedProxiesPath = $"{SectionName}:TrustedProxies";
    }

    public static class PurchaseToken
    {
        public const string SectionName = $"{AuthConfiguration.SectionName}:PurchaseToken";
        public const string RevenueCatApiKeyPath = $"{SectionName}:RevenueCatApiKey";
        public const string RevenueCatProjectIdPath = $"{SectionName}:RevenueCatProjectId";
        public const string RevenueCatProEntitlementIdPath =
            $"{SectionName}:RevenueCatProEntitlementId";
    }
}
