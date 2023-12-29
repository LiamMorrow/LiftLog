using Google.Protobuf;

namespace LiftLog.Ui.Models;

// source: https://learn.microsoft.com/en-us/aspnet/core/grpc/protobuf?view=aspnetcore-8.0
internal partial class DecimalValue
{
    private const decimal NanoFactor = 1_000_000_000;

    public DecimalValue(long units, int nanos)
    {
        Units = units;
        Nanos = nanos;
    }

    public static implicit operator decimal(DecimalValue grpcDecimal)
    {
        return grpcDecimal.Units + grpcDecimal.Nanos / NanoFactor;
    }

    public static implicit operator DecimalValue(decimal value)
    {
        var units = decimal.ToInt64(value);
        var nanos = decimal.ToInt32((value - units) * NanoFactor);
        return new DecimalValue(units, nanos);
    }

    public static implicit operator decimal?(DecimalValue? grpcDecimal)
    {
        if (grpcDecimal is null)
        {
            return null;
        }
        return grpcDecimal.Units + grpcDecimal.Nanos / NanoFactor;
    }

    public static implicit operator DecimalValue?(decimal? value)
    {
        if (value is null)
        {
            return null;
        }
        var units = decimal.ToInt64(value.Value);
        var nanos = decimal.ToInt32((value.Value - units) * NanoFactor);
        return new DecimalValue(units, nanos);
    }
}

internal partial class DateOnlyDao
{
    public DateOnlyDao(int year, int month, int day)
    {
        Year = year;
        Month = month;
        Day = day;
    }

    public static implicit operator DateOnly(DateOnlyDao dao) => new(dao.Year, dao.Month, dao.Day);

    public static implicit operator DateOnlyDao(DateOnly model) =>
        new(model.Year, model.Month, model.Day);

    public static implicit operator DateOnlyDao?(DateOnly? model) =>
        model is null
            ? null
            : new DateOnlyDao(model.Value.Year, model.Value.Month, model.Value.Day);

    public static implicit operator DateOnly?(DateOnlyDao? dao) =>
        dao is null ? null : new DateOnly(dao.Year, dao.Month, dao.Day);
}

internal partial class TimeOnlyDao
{
    public TimeOnlyDao(int hour, int minute, int second, int millisecond)
    {
        Hour = hour;
        Minute = minute;
        Second = second;
        Millisecond = millisecond;
    }

    public static implicit operator TimeOnly(TimeOnlyDao dao) =>
        new(dao.Hour, dao.Minute, dao.Second, dao.Millisecond);

    public static implicit operator TimeOnlyDao(TimeOnly model) =>
        new(model.Hour, model.Minute, model.Second, model.Millisecond);

    public static implicit operator TimeOnlyDao?(TimeOnly? model) =>
        model is null
            ? null
            : new TimeOnlyDao(
                model.Value.Hour,
                model.Value.Minute,
                model.Value.Second,
                model.Value.Millisecond
            );

    public static implicit operator TimeOnly?(TimeOnlyDao? dao) =>
        dao is null ? null : new TimeOnly(dao.Hour, dao.Minute, dao.Second, dao.Millisecond);
}

internal partial class UUIDDao
{
    public UUIDDao(Guid value)
    {
        Value = ByteString.CopyFrom(value.ToByteArray());
    }

    public static implicit operator UUIDDao(Guid value) => new(value);

    public static implicit operator Guid(UUIDDao dao) => new(dao.Value.ToByteArray());

    public static implicit operator UUIDDao?(Guid? value) =>
        value is null ? null : new UUIDDao(value.Value);

    public static implicit operator Guid?(UUIDDao? dao) =>
        dao is null ? null : new Guid(dao.Value.ToByteArray());
}
