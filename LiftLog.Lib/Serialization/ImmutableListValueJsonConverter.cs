using System.Text.Json;
using System.Text.Json.Serialization;
using static LiftLog.Lib.Util;

namespace LiftLog.Lib.Serialization
{
    public class ImmutableListValueJsonConverter : JsonConverterFactory
    {
        public override bool CanConvert(Type typeToConvert)
        {
            if (!typeToConvert.IsGenericType)
            {
                return false;
            }

            if (typeToConvert.GetGenericTypeDefinition() != typeof(ImmutableListValue<>))
            {
                return false;
            }

            return true;
        }

        public override JsonConverter? CreateConverter(Type type, JsonSerializerOptions options)
        {
            var converterType = typeof(ImmutableListValueJsonConverterInner<>).MakeGenericType(
                new[] { type.GetGenericArguments()[0] }
            );
            return (JsonConverter?)Activator.CreateInstance(converterType, new[] { options });
        }

        private class ImmutableListValueJsonConverterInner<T> : JsonConverter<ImmutableListValue<T>>
        {
            private readonly JsonConverter<List<T>> _jsonConverter;

            public ImmutableListValueJsonConverterInner(JsonSerializerOptions options)
            {
                _jsonConverter = (JsonConverter<List<T>>)options.GetConverter(typeof(List<T>));
            }

            public override ImmutableListValue<T>? Read(
                ref Utf8JsonReader reader,
                Type typeToConvert,
                JsonSerializerOptions options
            )
            {
                var list = _jsonConverter.Read(ref reader, typeof(List<T>), options);
                if (list is null)
                {
                    return null;
                }
                return ListOf<T>(list);
            }

            public override void Write(
                Utf8JsonWriter writer,
                ImmutableListValue<T> value,
                JsonSerializerOptions options
            )
            {
                _jsonConverter.Write(writer, [ .. value ], options);
            }
        }
    }
}
