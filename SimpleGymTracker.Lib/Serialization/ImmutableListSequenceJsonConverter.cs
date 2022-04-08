using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using static SimpleGymTracker.Lib.Util;

namespace SimpleGymTracker.Lib.Serialization
{
    public class ImmutableListSequenceJsonConverter : JsonConverterFactory
    {
        public override bool CanConvert(Type typeToConvert)
        {
            if (!typeToConvert.IsGenericType)
            {
                return false;
            }

            if (typeToConvert.GetGenericTypeDefinition() != typeof(ImmutableListSequence<>))
            {
                return false;
            }

            return true;
        }

        public override JsonConverter? CreateConverter(Type type, JsonSerializerOptions options)
        {
            var converterType = typeof(ImmutableListSequenceJsonConverterInner<>).MakeGenericType(
                new[] { type.GetGenericArguments()[0] }
            );
            return (JsonConverter?)Activator.CreateInstance(converterType, new[] { options });
        }

        private class ImmutableListSequenceJsonConverterInner<T>
            : JsonConverter<ImmutableListSequence<T>>
        {
            private readonly JsonConverter<List<T>> _jsonConverter;

            public ImmutableListSequenceJsonConverterInner(JsonSerializerOptions options)
            {
                _jsonConverter = (JsonConverter<List<T>>)options.GetConverter(typeof(List<T>));
            }

            public override ImmutableListSequence<T>? Read(
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
                ImmutableListSequence<T> value,
                JsonSerializerOptions options
            )
            {
                _jsonConverter.Write(writer, value.ToList(), options);
            }
        }
    }
}
