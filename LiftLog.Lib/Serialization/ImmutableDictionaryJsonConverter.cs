using System.Collections.Immutable;
using System.Text.Json;
using System.Text.Json.Serialization;
using static LiftLog.Lib.Util;

namespace LiftLog.Lib.Serialization
{
    public class ImmutableDictionaryJsonConverter : JsonConverterFactory
    {
        public override bool CanConvert(Type typeToConvert)
        {
            if (!typeToConvert.IsGenericType)
            {
                return false;
            }

            if (typeToConvert.GetGenericTypeDefinition() != typeof(ImmutableDictionary<,>))
            {
                return false;
            }

            return true;
        }

        public override JsonConverter? CreateConverter(Type type, JsonSerializerOptions options)
        {
            var genericArgs = type.GetGenericArguments();
            var converterType = typeof(ImmutableDictionaryJsonConverterInner<,>).MakeGenericType(
                new[] { genericArgs[0], genericArgs[1] }
            );
            return (JsonConverter?)Activator.CreateInstance(converterType, new[] { options });
        }

        private class ImmutableDictionaryJsonConverterInner<T, V>
            : JsonConverter<ImmutableDictionary<T, V>>
            where T : notnull
        {
            private readonly JsonConverter<Dictionary<T, V>> _jsonConverter;

            public ImmutableDictionaryJsonConverterInner(JsonSerializerOptions options)
            {
                _jsonConverter =
                    (JsonConverter<Dictionary<T, V>>)options.GetConverter(typeof(Dictionary<T, V>));
            }

            public override ImmutableDictionary<T, V>? Read(
                ref Utf8JsonReader reader,
                Type typeToConvert,
                JsonSerializerOptions options
            )
            {
                var dict = _jsonConverter.Read(ref reader, typeof(Dictionary<T, V>), options);
                if (dict is null)
                {
                    return null;
                }
                return dict.ToImmutableDictionary();
            }

            public override void Write(
                Utf8JsonWriter writer,
                ImmutableDictionary<T, V> value,
                JsonSerializerOptions options
            )
            {
                _jsonConverter.Write(writer, value.ToDictionary(x => x.Key, x => x.Value), options);
            }
        }
    }
}
