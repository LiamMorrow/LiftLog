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
    public partial class PublicApiKey : IAdditionalDataHolder, IParsable
    #pragma warning restore CS1591
    {
        /// <summary>Stores additional data not described in the OpenAPI description found when deserializing. Can be used for serialization as well.</summary>
        public IDictionary<string, object> AdditionalData { get; set; }
        /// <summary>The ID of the app the public API key is for</summary>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public string? AppId { get; set; }
#nullable restore
#else
        public string AppId { get; set; }
#endif
        /// <summary>The date when the public API key was created in ms since epoch</summary>
        public long? CreatedAt { get; set; }
        /// <summary>The environment the public API key is for</summary>
        public global::RevenueCat.Client.Models.PublicApiKey_environment? Environment { get; set; }
        /// <summary>The ID of the public API key</summary>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public string? Id { get; set; }
#nullable restore
#else
        public string Id { get; set; }
#endif
        /// <summary>The value of the public API key</summary>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public string? Key { get; set; }
#nullable restore
#else
        public string Key { get; set; }
#endif
        /// <summary>String representing the object&apos;s type. Objects of the same type share the same value.</summary>
        public global::RevenueCat.Client.Models.PublicApiKey_object? Object { get; set; }
        /// <summary>
        /// Instantiates a new <see cref="global::RevenueCat.Client.Models.PublicApiKey"/> and sets the default values.
        /// </summary>
        public PublicApiKey()
        {
            AdditionalData = new Dictionary<string, object>();
        }
        /// <summary>
        /// Creates a new instance of the appropriate class based on discriminator value
        /// </summary>
        /// <returns>A <see cref="global::RevenueCat.Client.Models.PublicApiKey"/></returns>
        /// <param name="parseNode">The parse node to use to read the discriminator value and create the object</param>
        public static global::RevenueCat.Client.Models.PublicApiKey CreateFromDiscriminatorValue(IParseNode parseNode)
        {
            _ = parseNode ?? throw new ArgumentNullException(nameof(parseNode));
            return new global::RevenueCat.Client.Models.PublicApiKey();
        }
        /// <summary>
        /// The deserialization information for the current model
        /// </summary>
        /// <returns>A IDictionary&lt;string, Action&lt;IParseNode&gt;&gt;</returns>
        public virtual IDictionary<string, Action<IParseNode>> GetFieldDeserializers()
        {
            return new Dictionary<string, Action<IParseNode>>
            {
                { "app_id", n => { AppId = n.GetStringValue(); } },
                { "created_at", n => { CreatedAt = n.GetLongValue(); } },
                { "environment", n => { Environment = n.GetEnumValue<global::RevenueCat.Client.Models.PublicApiKey_environment>(); } },
                { "id", n => { Id = n.GetStringValue(); } },
                { "key", n => { Key = n.GetStringValue(); } },
                { "object", n => { Object = n.GetEnumValue<global::RevenueCat.Client.Models.PublicApiKey_object>(); } },
            };
        }
        /// <summary>
        /// Serializes information the current object
        /// </summary>
        /// <param name="writer">Serialization writer to use to serialize this model</param>
        public virtual void Serialize(ISerializationWriter writer)
        {
            _ = writer ?? throw new ArgumentNullException(nameof(writer));
            writer.WriteStringValue("app_id", AppId);
            writer.WriteLongValue("created_at", CreatedAt);
            writer.WriteEnumValue<global::RevenueCat.Client.Models.PublicApiKey_environment>("environment", Environment);
            writer.WriteStringValue("id", Id);
            writer.WriteStringValue("key", Key);
            writer.WriteEnumValue<global::RevenueCat.Client.Models.PublicApiKey_object>("object", Object);
            writer.WriteAdditionalData(AdditionalData);
        }
    }
}
#pragma warning restore CS0618
