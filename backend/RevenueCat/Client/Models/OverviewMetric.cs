// <auto-generated/>
#pragma warning disable CS0618
using Microsoft.Kiota.Abstractions.Extensions;
using Microsoft.Kiota.Abstractions.Serialization;
using System.Collections.Generic;
using System.IO;
using System;
namespace RevenueCat.Client.Models
{
    [global::System.CodeDom.Compiler.GeneratedCode("Kiota", "1.0.0")]
    #pragma warning disable CS1591
    public partial class OverviewMetric : IAdditionalDataHolder, IParsable
    #pragma warning restore CS1591
    {
        /// <summary>Stores additional data not described in the OpenAPI description found when deserializing. Can be used for serialization as well.</summary>
        public IDictionary<string, object> AdditionalData { get; set; }
        /// <summary>Description of the overview metric</summary>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public string? Description { get; set; }
#nullable restore
#else
        public string Description { get; set; }
#endif
        /// <summary>Id of the overview metric</summary>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public string? Id { get; set; }
#nullable restore
#else
        public string Id { get; set; }
#endif
        /// <summary>Last time the overview metric was updated in ms since epoch</summary>
        public long? LastUpdatedAt { get; set; }
        /// <summary>Last time the overview metric was updated datetime in ISO 8601 format</summary>
        public DateTimeOffset? LastUpdatedAtIso8601 { get; set; }
        /// <summary>Display name of the overview metric</summary>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public string? Name { get; set; }
#nullable restore
#else
        public string Name { get; set; }
#endif
        /// <summary>String representing the object&apos;s type. Objects of the same type share the same value.</summary>
        public global::RevenueCat.Client.Models.OverviewMetric_object? Object { get; set; }
        /// <summary>Length of time during which metric data is collected in ISO 8601 format. Zero period means metric data was collected now</summary>
        public global::RevenueCat.Client.Models.OverviewMetric_period? Period { get; set; }
        /// <summary>Unit of the overview metric</summary>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public string? Unit { get; set; }
#nullable restore
#else
        public string Unit { get; set; }
#endif
        /// <summary>Value of the overview metric</summary>
        public double? Value { get; set; }
        /// <summary>
        /// Instantiates a new <see cref="global::RevenueCat.Client.Models.OverviewMetric"/> and sets the default values.
        /// </summary>
        public OverviewMetric()
        {
            AdditionalData = new Dictionary<string, object>();
        }
        /// <summary>
        /// Creates a new instance of the appropriate class based on discriminator value
        /// </summary>
        /// <returns>A <see cref="global::RevenueCat.Client.Models.OverviewMetric"/></returns>
        /// <param name="parseNode">The parse node to use to read the discriminator value and create the object</param>
        public static global::RevenueCat.Client.Models.OverviewMetric CreateFromDiscriminatorValue(IParseNode parseNode)
        {
            _ = parseNode ?? throw new ArgumentNullException(nameof(parseNode));
            return new global::RevenueCat.Client.Models.OverviewMetric();
        }
        /// <summary>
        /// The deserialization information for the current model
        /// </summary>
        /// <returns>A IDictionary&lt;string, Action&lt;IParseNode&gt;&gt;</returns>
        public virtual IDictionary<string, Action<IParseNode>> GetFieldDeserializers()
        {
            return new Dictionary<string, Action<IParseNode>>
            {
                { "description", n => { Description = n.GetStringValue(); } },
                { "id", n => { Id = n.GetStringValue(); } },
                { "last_updated_at", n => { LastUpdatedAt = n.GetLongValue(); } },
                { "last_updated_at_iso8601", n => { LastUpdatedAtIso8601 = n.GetDateTimeOffsetValue(); } },
                { "name", n => { Name = n.GetStringValue(); } },
                { "object", n => { Object = n.GetEnumValue<global::RevenueCat.Client.Models.OverviewMetric_object>(); } },
                { "period", n => { Period = n.GetEnumValue<global::RevenueCat.Client.Models.OverviewMetric_period>(); } },
                { "unit", n => { Unit = n.GetStringValue(); } },
                { "value", n => { Value = n.GetDoubleValue(); } },
            };
        }
        /// <summary>
        /// Serializes information the current object
        /// </summary>
        /// <param name="writer">Serialization writer to use to serialize this model</param>
        public virtual void Serialize(ISerializationWriter writer)
        {
            _ = writer ?? throw new ArgumentNullException(nameof(writer));
            writer.WriteStringValue("description", Description);
            writer.WriteStringValue("id", Id);
            writer.WriteLongValue("last_updated_at", LastUpdatedAt);
            writer.WriteDateTimeOffsetValue("last_updated_at_iso8601", LastUpdatedAtIso8601);
            writer.WriteStringValue("name", Name);
            writer.WriteEnumValue<global::RevenueCat.Client.Models.OverviewMetric_object>("object", Object);
            writer.WriteEnumValue<global::RevenueCat.Client.Models.OverviewMetric_period>("period", Period);
            writer.WriteStringValue("unit", Unit);
            writer.WriteDoubleValue("value", Value);
            writer.WriteAdditionalData(AdditionalData);
        }
    }
}
#pragma warning restore CS0618
