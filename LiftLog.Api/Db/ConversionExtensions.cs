namespace LiftLog.Api.Db;

using System.Globalization;
using System.Text;
using Microsoft.EntityFrameworkCore;

public static class ConversionExtensions
{
    private static CultureInfo _culture = CultureInfo.InvariantCulture;

    public static void ToSnakeCaseNames(this ModelBuilder modelBuilder)
    {
        _culture = CultureInfo.InvariantCulture;

        SetNames(modelBuilder, NamingConvention.SnakeCase);
    }

    public static void ToLowerCaseNames(this ModelBuilder modelBuilder)
    {
        _culture = CultureInfo.InvariantCulture;

        SetNames(modelBuilder, NamingConvention.LowerCase);
    }

    private static string? NameRewriter(this string name, NamingConvention naming)
    {
        if (string.IsNullOrEmpty(name))
            return name;

        return naming == NamingConvention.SnakeCase
            ? SnakeCaseNameRewriter(name)
            : LowerCaseNameRewriter(name);
    }

    private enum NamingConvention
    {
        SnakeCase,
        LowerCase,
    }

    private static void SetNames(ModelBuilder modelBuilder, NamingConvention naming)
    {
        _culture = CultureInfo.InvariantCulture;

        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            entity.SetViewName(entity.GetViewName()?.NameRewriter(naming));
            entity.SetSchema(entity.GetSchema()?.NameRewriter(naming));
            entity.SetTableName(entity.GetTableName()?.NameRewriter(naming));

            foreach (var property in entity!.GetProperties())
            {
                property.SetColumnName(property.GetColumnName()?.NameRewriter(naming));
            }

            foreach (var key in entity.GetKeys())
            {
                key.SetName(key.GetName()?.NameRewriter(naming));
            }

            foreach (var key in entity.GetForeignKeys())
            {
                key.SetConstraintName(key.GetConstraintName()?.NameRewriter(naming));
            }

            foreach (var index in entity.GetIndexes())
            {
                index.SetDatabaseName(index.GetDatabaseName()?.NameRewriter(naming));
            }
        }
    }

    private static string? LowerCaseNameRewriter(string name) => name.ToLower(_culture);

    // https://github.com/efcore/EFCore.NamingConventions/blob/main/EFCore.NamingConventions/Internal/SnakeCaseNameRewriter.cs
    private static string SnakeCaseNameRewriter(string name)
    {
        var builder = new StringBuilder(name.Length + Math.Min(2, name.Length / 5));
        var previousCategory = default(UnicodeCategory?);

        for (var currentIndex = 0; currentIndex < name.Length; currentIndex++)
        {
            var currentChar = name[currentIndex];
            if (currentChar == '_')
            {
                builder.Append('_');
                previousCategory = null;
                continue;
            }

            var currentCategory = char.GetUnicodeCategory(currentChar);
            switch (currentCategory)
            {
                case UnicodeCategory.UppercaseLetter:
                case UnicodeCategory.TitlecaseLetter:
                    if (
                        previousCategory == UnicodeCategory.SpaceSeparator
                        || previousCategory == UnicodeCategory.LowercaseLetter
                        || previousCategory != UnicodeCategory.DecimalDigitNumber
                            && previousCategory != null
                            && currentIndex > 0
                            && currentIndex + 1 < name.Length
                            && char.IsLower(name[currentIndex + 1])
                    )
                    {
                        builder.Append('_');
                    }

                    currentChar = char.ToLower(currentChar, _culture);
                    break;

                case UnicodeCategory.LowercaseLetter:
                case UnicodeCategory.DecimalDigitNumber:
                    if (previousCategory == UnicodeCategory.SpaceSeparator)
                    {
                        builder.Append('_');
                    }
                    break;

                default:
                    if (previousCategory != null)
                    {
                        previousCategory = UnicodeCategory.SpaceSeparator;
                    }
                    continue;
            }

            builder.Append(currentChar);
            previousCategory = currentCategory;
        }

        return builder.ToString().ToLower(_culture);
    }
}
