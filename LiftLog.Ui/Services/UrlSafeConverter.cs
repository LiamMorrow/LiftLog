using System.Diagnostics.CodeAnalysis;

namespace LiftLog.Ui.Services;

public static class UrlSafeConverter
{
    public static string ToUrlSafeHexString(this byte[] bytes)
    {
        return Convert.ToHexString(bytes).Replace("-", "");
    }

    public static byte[]? FromUrlSafeHexString(this string? hexString)
    {
        if (string.IsNullOrEmpty(hexString))
        {
            return null;
        }
        return Enumerable
            .Range(0, hexString.Length)
            .Where(x => x % 2 == 0)
            .Select(x => Convert.ToByte(hexString.Substring(x, 2), 16))
            .ToArray();
    }
}
