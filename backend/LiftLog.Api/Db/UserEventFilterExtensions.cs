using System.Text;
using LiftLog.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LiftLog.Api.Db;

public static class UserEventFilterExtensions
{
    public static IQueryable<UserEventFilter> CreateResultSetFromData(
        this DbSet<UserEventFilter> dbSet,
        IReadOnlyList<UserEventFilter> values
    )
    {
        // UserEventFilter is the entity POCO class. This one has two properties, A and B, corresponding to two columns of data.

        var columnNames = (UserId: "user_id", Since: "since");

        if (values.Any())
        {
            // Create a UNION of SELECT "PredefinedDataA" AS `A`, SELECT "PredefinedDataB" AS `B`
            // This generates a temporary result set from the input values.

            object[] staticDataArray = new object[values.Count * 2];
            var queryStringBuilder = new StringBuilder();

            for (int i = 0; i < values.Count; i++)
            {
                int dataIndex = i * 2;
                if (i == 0)
                {
                    queryStringBuilder.Append(
                        $"SELECT {{{dataIndex}}}::UUID AS {columnNames.UserId}, {{{dataIndex + 1}}} AS {columnNames.Since} "
                    );
                }
                else
                {
                    queryStringBuilder.Append(
                        $"UNION SELECT {{{dataIndex}}}::UUID, {{{dataIndex + 1}}} "
                    );
                }

                // Build one-dimensional array of the values to pass into FromSqlRaw as parameters
                staticDataArray[dataIndex] = values[i].UserId;
                staticDataArray[dataIndex + 1] = values[i].Since;
            }

            return dbSet.FromSqlRaw(queryStringBuilder.ToString(), staticDataArray).AsNoTracking();
        }
        else
        {
            // No data, return empty result set
#pragma warning disable EF1002 // Risk of vulnerability to SQL injection.
            return dbSet
                .FromSqlRaw(
                    $"SELECT NULL AS {columnNames.UserId}, NULL AS {columnNames.Since} WHERE FALSE"
                )
                .AsNoTracking();
#pragma warning restore EF1002 // Risk of vulnerability to SQL injection.
        }
    }
}
